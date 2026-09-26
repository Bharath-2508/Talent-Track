import numpy as np
from scipy.spatial.distance import euclidean

class Comparer:
    def __init__(self):
        pass

    def compute_similarity(self, new_features: dict, reference_features: dict) -> dict:
        """
        Compare new athlete features with reference learned running patterns.
        Returns a percentage similarity for different categories.
        """
        # Similarity is bounded between 0 and 100
        def calculate_sim(val, ref, max_diff=30.0):
            diff = abs(val - ref)
            sim = max(0, 100 - (diff / max_diff) * 100)
            return sim
            
        similarities = {}
        
        # Posture similarity (Body lean)
        if "body_lean_angle_mean" in new_features and "body_lean_angle_mean" in reference_features:
            similarities["posture"] = calculate_sim(new_features["body_lean_angle_mean"], reference_features["body_lean_angle_mean"], 15.0)
            
        # Arm movement similarity (Elbow angles)
        if "left_elbow_angle_range" in new_features and "left_elbow_angle_range" in reference_features:
            arm_sim = (calculate_sim(new_features["left_elbow_angle_range"], reference_features["left_elbow_angle_range"], 40.0) +
                       calculate_sim(new_features["right_elbow_angle_range"], reference_features["right_elbow_angle_range"], 40.0)) / 2
            similarities["arm_movement"] = arm_sim
            
        # Leg movement similarity (Knee lift)
        if "knee_lift_metric" in new_features and "knee_lift_metric" in reference_features:
            similarities["leg_movement"] = calculate_sim(new_features["knee_lift_metric"], reference_features["knee_lift_metric"], 30.0)
            
        # Overall similarity (Euclidean distance on all normalized features)
        # For simplicity, we just average the sub-similarities
        if similarities:
            similarities["overall_movement_similarity"] = sum(similarities.values()) / len(similarities)
        else:
            similarities["overall_movement_similarity"] = 0.0
            
        return similarities
