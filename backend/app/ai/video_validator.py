"""Video Validator — pre-pipeline validation for running practice videos.

Stops invalid or irrelevant videos BEFORE any ML inference, scoring, or report generation.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np

log = logging.getLogger(__name__)

from .running_analyzer import _ensure_model

LM = {
    "left_shoulder": 11,  "right_shoulder": 12,
    "left_hip": 23,       "right_hip": 24,
    "left_knee": 25,      "right_knee": 26,
    "left_ankle": 27,     "right_ankle": 28,
}


@dataclass
class ValidationResult:
    is_valid: bool
    rejection_reason: str
    human_detected: bool
    full_body_detected: bool
    pose_detection_rate: float
    motion_detected: bool
    running_motion_score: float


def _dist(a, b) -> float:
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)


def _angle_deg(a, b, c) -> float:
    ba = np.array([a.x - b.x, a.y - b.y])
    bc = np.array([c.x - b.x, c.y - b.y])
    cos_a = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-9)
    return float(np.degrees(np.arccos(np.clip(cos_a, -1, 1))))


def validate_running_video(video_path: str) -> ValidationResult:
    """Pre-pipeline validator.

    Checks:
    1. Video file accessibility
    2. Human pose detection
    3. Full-body joint visibility (shoulders, hips, knees, ankles)
    4. Pose detection rate across frames
    5. Running motion (knee flex/extension range & stride displacement variance)
    """
    path = Path(video_path)
    if not path.exists():
        res = ValidationResult(
            is_valid=False,
            rejection_reason="Video file not found on server.",
            human_detected=False,
            full_body_detected=False,
            pose_detection_rate=0.0,
            motion_detected=False,
            running_motion_score=0.0,
        )
        _log_validation(res)
        return res

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        res = ValidationResult(
            is_valid=False,
            rejection_reason="Cannot open or read uploaded video file.",
            human_detected=False,
            full_body_detected=False,
            pose_detection_rate=0.0,
            motion_detected=False,
            running_motion_score=0.0,
        )
        _log_validation(res)
        return res

    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision

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

    total_sampled = 0
    human_frames = 0
    full_body_frames = 0
    knee_angles: list[float] = []
    strides: list[float] = []

    frame_skip = 4

    try:
        with mp_vision.PoseLandmarker.create_from_options(options) as landmarker:
            frame_idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frame_idx += 1
                if frame_idx % frame_skip != 0:
                    continue

                total_sampled += 1

                # Resize frame to max width 640 for fast processing
                h, w = frame.shape[:2]
                if w > 640:
                    frame = cv2.resize(frame, (640, int(h * 640 / w)))

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                detection = landmarker.detect(mp_image)

                if not detection.pose_landmarks:
                    continue

                human_frames += 1
                lm_list = detection.pose_landmarks[0]

                # Key joints for full body check
                ls, rs = lm_list[LM["left_shoulder"]], lm_list[LM["right_shoulder"]]
                lh, rh = lm_list[LM["left_hip"]], lm_list[LM["right_hip"]]
                lk, rk = lm_list[LM["left_knee"]], lm_list[LM["right_knee"]]
                la, ra = lm_list[LM["left_ankle"]], lm_list[LM["right_ankle"]]

                key_pts = [ls, rs, lh, rh, lk, rk, la, ra]
                visibilities = [getattr(pt, 'visibility', 1.0) for pt in key_pts]
                avg_vis = sum(visibilities) / len(visibilities) if visibilities else 0.0

                if avg_vis >= 0.45:
                    full_body_frames += 1
                    body_h = _dist(ls, la) + 1e-9
                    k_angle = (_angle_deg(lh, lk, la) + _angle_deg(rh, rk, ra)) / 2.0
                    stride_val = abs(la.x - ra.x) / body_h
                    knee_angles.append(k_angle)
                    strides.append(stride_val)
    finally:
        cap.release()

    human_detected = human_frames > 0
    full_body_detected = full_body_frames >= 2
    pose_detection_rate = round((full_body_frames / total_sampled * 100.0), 2) if total_sampled > 0 else (100.0 if human_detected else 0.0)

    knee_range = (max(knee_angles) - min(knee_angles)) if len(knee_angles) >= 2 else 0.0
    stride_std = float(np.std(strides)) if len(strides) >= 2 else 0.0

    motion_score = min(100.0, (knee_range / 30.0 * 50.0) + (stride_std / 0.02 * 50.0))
    # Consider motion detected if there is body movement or human frames detected
    motion_detected = human_detected and (knee_range >= 10.0 or stride_std >= 0.003 or human_frames >= 3)

    is_valid = True
    rejection_reason = ""

    if not human_detected:
        is_valid = False
        rejection_reason = "Invalid practice video: No human subject detected in video. Please upload a clear practice video of an athlete."
    elif not full_body_detected and pose_detection_rate < 15.0:
        is_valid = False
        rejection_reason = f"Invalid practice video: Full body not clearly visible throughout video (detection rate {pose_detection_rate:.1f}%)."
    elif not motion_detected:
        is_valid = False
        rejection_reason = "Invalid practice video: Human running motion not detected. Video shows static pose, non-running movement, or non-athlete activity."

    result = ValidationResult(
        is_valid=is_valid,
        rejection_reason=rejection_reason,
        human_detected=human_detected,
        full_body_detected=full_body_detected,
        pose_detection_rate=pose_detection_rate,
        motion_detected=motion_detected,
        running_motion_score=round(motion_score, 2),
    )

    _log_validation(result)
    return result


def _log_validation(r: ValidationResult) -> None:
    log.info("[VALIDATION] human_detected=%s", r.human_detected)
    log.info("[VALIDATION] full_body_detected=%s", r.full_body_detected)
    log.info("[VALIDATION] pose_detection_rate=%.2f%%", r.pose_detection_rate)
    log.info("[VALIDATION] motion_detected=%s", r.motion_detected)
    log.info("[VALIDATION] running_motion_score=%.2f", r.running_motion_score)
    log.info("[VALIDATION] is_valid=%s", r.is_valid)
    log.info("[VALIDATION] rejection_reason=%s", r.rejection_reason)
