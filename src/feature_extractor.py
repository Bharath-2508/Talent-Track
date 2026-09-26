import math
import numpy as np
from typing import Dict, Any, List

class FeatureExtractor:
    def __init__(self):
        pass

    def calculate_angle(self, a, b, c):
        """
        Calculate the angle between three points (a, b, c) in 2D space (x, y).
        """
        radians = math.atan2(c['y'] - b['y'], c['x'] - b['x']) - \
                  math.atan2(a['y'] - b['y'], a['x'] - b['x'])
        angle = abs(radians * 180.0 / math.pi)
        if angle > 180.0:
            angle = 360 - angle
        return angle

    def calculate_distance(self, p1, p2):
        """Calculate Euclidean distance between two points."""
        return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)

    def extract_frame_features(self, landmarks: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract numerical features from a single frame's landmarks.
        """
        features = {}
        
        # Angles
        features["left_knee_angle"] = self.calculate_angle(landmarks["left_hip"], landmarks["left_knee"], landmarks["left_ankle"])
        features["right_knee_angle"] = self.calculate_angle(landmarks["right_hip"], landmarks["right_knee"], landmarks["right_ankle"])
        
        features["left_hip_angle"] = self.calculate_angle(landmarks["left_shoulder"], landmarks["left_hip"], landmarks["left_knee"])
        features["right_hip_angle"] = self.calculate_angle(landmarks["right_shoulder"], landmarks["right_hip"], landmarks["right_knee"])
        
        features["left_elbow_angle"] = self.calculate_angle(landmarks["left_shoulder"], landmarks["left_elbow"], landmarks["left_wrist"])
        features["right_elbow_angle"] = self.calculate_angle(landmarks["right_shoulder"], landmarks["right_elbow"], landmarks["right_wrist"])
        
        features["left_ankle_angle"] = self.calculate_angle(landmarks["left_knee"], landmarks["left_ankle"], landmarks["left_foot_index"])
        features["right_ankle_angle"] = self.calculate_angle(landmarks["right_knee"], landmarks["right_ankle"], landmarks["right_foot_index"])

        # Body Lean / Torso Angle (Vertical vs Torso line)
        mid_shoulder = {
            "x": (landmarks["left_shoulder"]["x"] + landmarks["right_shoulder"]["x"]) / 2,
            "y": (landmarks["left_shoulder"]["y"] + landmarks["right_shoulder"]["y"]) / 2
        }
        mid_hip = {
            "x": (landmarks["left_hip"]["x"] + landmarks["right_hip"]["x"]) / 2,
            "y": (landmarks["left_hip"]["y"] + landmarks["right_hip"]["y"]) / 2
        }
        # Point straight down from mid_shoulder
        vertical_ref = {"x": mid_shoulder["x"], "y": mid_shoulder["y"] + 1.0}
        
        features["body_lean_angle"] = self.calculate_angle(mid_hip, mid_shoulder, vertical_ref)

        # Symmetry features
        features["knee_angle_diff"] = abs(features["left_knee_angle"] - features["right_knee_angle"])
        features["elbow_angle_diff"] = abs(features["left_elbow_angle"] - features["right_elbow_angle"])
        
        # Ranges/Distances
        features["stride_width_norm"] = self.calculate_distance(landmarks["left_ankle"], landmarks["right_ankle"])
        features["arm_swing_norm"] = self.calculate_distance(landmarks["left_wrist"], landmarks["right_wrist"])

        return features

    def aggregate_video_features(self, frames_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate frame-level features into video-level features (mean, std, min, max, ranges).
        """
        if not frames_data:
            return {}

        all_frame_features = []
        for frame in frames_data:
            if frame["detected"]:
                features = self.extract_frame_features(frame["landmarks"])
                all_frame_features.append(features)

        if not all_frame_features:
            return {}

        aggregated = {}
        feature_keys = all_frame_features[0].keys()

        for key in feature_keys:
            values = [f[key] for f in all_frame_features]
            aggregated[f"{key}_mean"] = np.mean(values)
            aggregated[f"{key}_std"] = np.std(values)
            aggregated[f"{key}_min"] = np.min(values)
            aggregated[f"{key}_max"] = np.max(values)
            aggregated[f"{key}_range"] = aggregated[f"{key}_max"] - aggregated[f"{key}_min"]

        # High-level assessment features based on aggregates
        aggregated["movement_consistency"] = 1.0 / (np.mean([aggregated[f"{k}_std"] for k in feature_keys]) + 1e-5)
        aggregated["posture_stability"] = 1.0 / (aggregated["body_lean_angle_std"] + 1e-5)
        
        # Calculate Knee Lift (Max angle/height differences)
        # Higher range of knee angle suggests better lift
        aggregated["knee_lift_metric"] = max(aggregated["left_knee_angle_range"], aggregated["right_knee_angle_range"])
        
        # Left/Right symmetry overall
        aggregated["overall_symmetry"] = 1.0 / (np.mean([aggregated["knee_angle_diff_mean"], aggregated["elbow_angle_diff_mean"]]) + 1e-5)

        return aggregated

        
