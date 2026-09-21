"""Benchmark metric ranges derived from the 93 running sprint videos.

These ranges represent the realistic min/max for each biomechanical metric
across amateur runners at 8–13 km/h. Used for scoring (0–100 scale).

Scoring formula:
    score = clamp((value - poor) / (excellent - poor) * 100, 0, 100)
    where higher value = better performance for most metrics.

Each entry: (metric_key, poor_threshold, excellent_threshold)
"""

# Trunk lean: degrees from vertical (lower = more upright = better for sprinting)
# Inverted: poor is >15°, excellent is <5°
TRUNK_LEAN_RANGE = (15.0, 5.0)  # (poor, excellent) — inverted

# Knee drive angle: peak knee angle at highest lift (degrees). Higher = better knee drive.
KNEE_DRIVE_RANGE = (50.0, 110.0)  # (poor, excellent)

# Arm swing amplitude: average wrist vertical displacement (px normalised to body height).
# Higher ratio = bigger arm swing = better.
ARM_SWING_RANGE = (0.04, 0.18)  # (poor, excellent)

# Left-right symmetry: ratio of left/right wrist amplitude (0=asymmetric, 1=perfect)
SYMMETRY_RANGE = (0.60, 0.96)   # (poor, excellent)

# Stride length proxy: horizontal ankle span normalised to body height
STRIDE_RANGE = (0.30, 0.80)     # (poor, excellent)

# Body alignment: shoulder-hip-ankle collinearity score (0=bad, 1=perfect line)
ALIGNMENT_RANGE = (0.50, 0.92)  # (poor, excellent)


def score_metric(value: float, poor: float, excellent: float, inverted: bool = False) -> int:
    """Return 0–100 score for a metric value given its range."""
    if inverted:
        value = poor + excellent - value  # flip
        poor, excellent = excellent, poor + excellent - excellent

    span = excellent - poor
    if span == 0:
        return 50
    raw = (value - poor) / span * 100
    return int(max(0, min(100, round(raw))))
