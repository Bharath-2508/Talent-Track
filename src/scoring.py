class Scorer:
    def __init__(self):
        # Max scores per category
        self.max_scores = {
            "posture": 20,
            "arm_movement": 15,
            "leg_movement": 20,
            "body_alignment": 15,
            "running_technique": 20,
            "symmetry": 10
        }

    def generate_score(self, features: dict, similarities: dict) -> dict:
        """
        Generate a Running Assessment Score from 0 to 100 based on extracted features and reference similarity.
        """
        score_breakdown = {}
        total_score = 0
        
        def safe_get(sim_dict, key):
            return sim_dict.get(key, 50.0) # Default to 50% if missing
            
        # Posture (20)
        posture_score = (safe_get(similarities, "posture") / 100.0) * self.max_scores["posture"]
        score_breakdown["posture"] = {
            "score": int(posture_score),
            "max_score": self.max_scores["posture"],
            "analysis": f"Posture similarity is {safe_get(similarities, 'posture'):.1f}%. Good forward lean." if posture_score > 15 else "Body lean is outside optimal range."
        }
        total_score += int(posture_score)
        
        # Arm Movement (15)
        arm_score = (safe_get(similarities, "arm_movement") / 100.0) * self.max_scores["arm_movement"]
        score_breakdown["arm_movement"] = {
            "score": int(arm_score),
            "max_score": self.max_scores["arm_movement"],
            "analysis": "Efficient arm swing." if arm_score > 10 else "Arm swing is too stiff or excessive."
        }
        total_score += int(arm_score)
        
        # Leg/Knee Movement (20)
        leg_score = (safe_get(similarities, "leg_movement") / 100.0) * self.max_scores["leg_movement"]
        score_breakdown["leg_movement"] = {
            "score": int(leg_score),
            "max_score": self.max_scores["leg_movement"],
            "analysis": "Excellent knee lift and stride mechanics." if leg_score > 15 else "Knee lift is below optimal reference."
        }
        total_score += int(leg_score)
        
        # Body Alignment (15)
        # Using a proxy for alignment (can be expanded)
        align_score = (safe_get(similarities, "posture") / 100.0) * self.max_scores["body_alignment"]
        score_breakdown["body_alignment"] = {
            "score": int(align_score),
            "max_score": self.max_scores["body_alignment"],
            "analysis": "Body alignment matches reference well." if align_score > 10 else "Potential overstriding or poor alignment."
        }
        total_score += int(align_score)
        
        # Running Technique (20)
        tech_score = (safe_get(similarities, "overall_movement_similarity") / 100.0) * self.max_scores["running_technique"]
        score_breakdown["running_technique"] = {
            "score": int(tech_score),
            "max_score": self.max_scores["running_technique"],
            "analysis": "Overall technique is consistent with elite references." if tech_score > 15 else "Technique shows multiple deviations from reference."
        }
        total_score += int(tech_score)
        
        # Symmetry (10)
        # Using extracted symmetry features if available
        symmetry_metric = features.get("overall_symmetry", 0.5)
        # Normalize to 0-1
        sym_norm = min(1.0, symmetry_metric * 10) 
        sym_score = sym_norm * self.max_scores["symmetry"]
        score_breakdown["symmetry"] = {
            "score": int(sym_score),
            "max_score": self.max_scores["symmetry"],
            "analysis": "Good left/right balance." if sym_score > 7 else "Noticeable asymmetry between left and right side."
        }
        total_score += int(sym_score)
        
        return {
            "overall_score": total_score,
            "breakdown": score_breakdown
        }
