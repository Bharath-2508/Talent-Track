"""Running biomechanical analyzer using MediaPipe Tasks Pose Landmarker.

Uses MediaPipe 1.0+ Tasks API (mp.tasks) which replaced the legacy mp.solutions API.

Pipeline:
1. OpenCV — extract every Nth frame from uploaded video
2. MediaPipe Pose Landmarker — estimate 33 body landmarks per frame
3. Compute 6 biomechanical metrics per frame, averaged across all frames
4. Score each metric against benchmark ranges (benchmarks.py)
5. Return structured dict with all report data
"""
from __future__ import annotations

import logging
import math
import os
import urllib.request
from pathlib import Path
from typing import Any

import cv2
import numpy as np

log = logging.getLogger(__name__)

from .benchmarks import (
    ALIGNMENT_RANGE,
    ARM_SWING_RANGE,
    KNEE_DRIVE_RANGE,
    STRIDE_RANGE,
    SYMMETRY_RANGE,
    TRUNK_LEAN_RANGE,
    score_metric,
)

# ── MediaPipe model download ──────────────────────────────────────────────────

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "pose_landmarker_lite.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"

def _ensure_model() -> str:
    if not MODEL_PATH.exists():
        log.info("Downloading MediaPipe pose model (~5 MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        log.info("Model downloaded to %s", MODEL_PATH)
    return str(MODEL_PATH)


# ── Landmark indices (MediaPipe 33-point schema) ──────────────────────────────
# https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

LM = {
    "left_shoulder": 11,  "right_shoulder": 12,
    "left_hip": 23,       "right_hip": 24,
    "left_knee": 25,      "right_knee": 26,
    "left_ankle": 27,     "right_ankle": 28,
    "left_wrist": 15,     "right_wrist": 16,
}

FRAME_SKIP = 3
MIN_FRAMES = 5


def _pt(lm_list: list, idx: int):
    """Get landmark by index."""
    return lm_list[idx]


def _dist(a, b) -> float:
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)


def _angle_deg(a, b, c) -> float:
    """Angle at joint B formed by points A-B-C in degrees."""
    ba = np.array([a.x - b.x, a.y - b.y])
    bc = np.array([c.x - b.x, c.y - b.y])
    cos_a = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-9)
    return float(np.degrees(np.arccos(np.clip(cos_a, -1, 1))))


def _analyze_frame(lm_list: list) -> dict[str, float] | None:
    try:
        ls = _pt(lm_list, LM["left_shoulder"])
        rs = _pt(lm_list, LM["right_shoulder"])
        lh = _pt(lm_list, LM["left_hip"])
        rh = _pt(lm_list, LM["right_hip"])
        lk = _pt(lm_list, LM["left_knee"])
        rk = _pt(lm_list, LM["right_knee"])
        la = _pt(lm_list, LM["left_ankle"])
        ra = _pt(lm_list, LM["right_ankle"])
        lw = _pt(lm_list, LM["left_wrist"])
        rw = _pt(lm_list, LM["right_wrist"])

        body_h = _dist(ls, la) + 1e-9

        # 1. Trunk lean
        s_mid_x = (ls.x + rs.x) / 2; s_mid_y = (ls.y + rs.y) / 2
        h_mid_x = (lh.x + rh.x) / 2; h_mid_y = (lh.y + rh.y) / 2
        dx = s_mid_x - h_mid_x; dy = s_mid_y - h_mid_y
        trunk_lean = abs(math.degrees(math.atan2(abs(dx), abs(dy) + 1e-9)))

        # 2. Knee drive
        knee_angle = (_angle_deg(lh, lk, la) + _angle_deg(rh, rk, ra)) / 2

        # 3. Arm swing
        wrist_amp_l = abs(lw.y - lh.y) / body_h
        wrist_amp_r = abs(rw.y - rh.y) / body_h
        arm_swing = (wrist_amp_l + wrist_amp_r) / 2

        # 4. Symmetry
        symmetry = min(wrist_amp_l, wrist_amp_r) / (max(wrist_amp_l, wrist_amp_r) + 1e-9)

        # 5. Stride
        stride = abs(la.x - ra.x) / body_h

        # 6. Body alignment
        v1 = np.array([h_mid_x - s_mid_x, h_mid_y - s_mid_y])
        a_mid_x = (la.x + ra.x) / 2; a_mid_y = (la.y + ra.y) / 2
        v2 = np.array([a_mid_x - s_mid_x, a_mid_y - s_mid_y])
        cross = abs(v1[0] * v2[1] - v1[1] * v2[0])
        alignment = 1.0 - min(cross / (body_h + 1e-9), 1.0)

        return {
            "trunk_lean": trunk_lean,
            "knee_drive": knee_angle,
            "arm_swing": arm_swing,
            "symmetry": symmetry,
            "stride": stride,
            "alignment": alignment,
        }
    except Exception as exc:
        log.debug("Frame metric error: %s", exc)
        return None


def analyze_video(video_path: str) -> dict[str, Any]:
    """Run full pose pipeline on a video file.

    Returns dict compatible with report_builder.build_report().
    """
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision

    path = Path(video_path)
    if not path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    model_path = _ensure_model()

    base_options = mp_python.BaseOptions(model_asset_path=model_path)
    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.IMAGE,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    frame_metrics: list[dict[str, float]] = []
    frame_idx = 0

    try:
        with mp_vision.PoseLandmarker.create_from_options(options) as landmarker:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frame_idx += 1
                if frame_idx % FRAME_SKIP != 0:
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                result = landmarker.detect(mp_image)

                if not result.pose_landmarks:
                    continue

                lm_list = result.pose_landmarks[0]
                metrics = _analyze_frame(lm_list)
                if metrics:
                    frame_metrics.append(metrics)
    finally:
        cap.release()

    if len(frame_metrics) < MIN_FRAMES:
        log.warning("Only %d valid frames in %s", len(frame_metrics), video_path)
        return _fallback_result()

    avg: dict[str, float] = {
        k: float(np.mean([f[k] for f in frame_metrics]))
        for k in frame_metrics[0]
    }

    posture_score   = score_metric(avg["trunk_lean"], *TRUNK_LEAN_RANGE, inverted=True)
    knee_score      = score_metric(avg["knee_drive"], *KNEE_DRIVE_RANGE)
    arm_score       = score_metric(avg["arm_swing"],  *ARM_SWING_RANGE)
    symmetry_score  = score_metric(avg["symmetry"],   *SYMMETRY_RANGE)
    stride_score    = score_metric(avg["stride"],     *STRIDE_RANGE)
    alignment_score = score_metric(avg["alignment"],  *ALIGNMENT_RANGE)

    metric_scores = {
        "Posture":             posture_score,
        "Arm Movement":        arm_score,
        "Leg / Knee Movement": knee_score,
        "Body Alignment":      alignment_score,
        "Running Technique":   int((stride_score + knee_score) / 2),
        "Movement Symmetry":   symmetry_score,
    }

    weights = [0.20, 0.15, 0.20, 0.15, 0.15, 0.15]
    overall = int(sum(s * w for s, w in zip(metric_scores.values(), weights)))
    overall = max(30, min(100, overall))

    metrics_list = [{"label": k, "value": v} for k, v in metric_scores.items()]
    strengths = [k for k, v in metric_scores.items() if v >= 75]
    weaknesses = [
        {"name": k, "impact": _impact(v)}
        for k, v in metric_scores.items()
        if v < 65
    ]

    return {
        "overall_score": overall,
        "metrics": metrics_list,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "raw_avg": avg,
    }


def _impact(score: int) -> str:
    if score < 45: return "High impact — focus here first"
    if score < 55: return "Medium impact — will improve efficiency"
    return "Minor — targeted drills will help"


def _fallback_result() -> dict[str, Any]:
    metrics = [
        {"label": "Posture",             "value": 0},
        {"label": "Arm Movement",        "value": 0},
        {"label": "Leg / Knee Movement", "value": 0},
        {"label": "Body Alignment",      "value": 0},
        {"label": "Running Technique",   "value": 0},
        {"label": "Movement Symmetry",   "value": 0},
    ]
    return {
        "overall_score": 0,
        "metrics": metrics,
        "strengths": [],
        "weaknesses": [],
        "raw_avg": {},
        "note": "Not enough pose data detected. Ensure full body is visible in good lighting.",
    }
