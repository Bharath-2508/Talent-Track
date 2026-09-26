import json
import os

class ReportGenerator:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_report(self, video_filename: str, pose_rate: float, score_data: dict, similarities: dict) -> dict:
        """
        Generate the final assessment report and save to JSON.
        """
        
        strengths = []
        weaknesses = []
        recommendations = []
        
        breakdown = score_data["breakdown"]
        
        for cat, data in breakdown.items():
            percentage = data["score"] / data["max_score"]
            if percentage >= 0.75:
                strengths.append(f"Strong {cat.replace('_', ' ')} ({data['score']}/{data['max_score']})")
            elif percentage <= 0.5:
                weaknesses.append(f"Needs improvement in {cat.replace('_', ' ')} ({data['score']}/{data['max_score']})")
                recommendations.append(f"Focus on drills improving {cat.replace('_', ' ')}.")
                
        if not strengths:
            strengths.append("Found foundational movement patterns, but overall form requires development.")
        if not weaknesses:
            weaknesses.append("No major critical weaknesses detected compared to reference.")
        if not recommendations:
            recommendations.append("Continue current training regimen to maintain form.")

        assessment = {
            "video": video_filename,
            "pose_detection_rate": round(pose_rate, 2),
            "overall_score": score_data["overall_score"],
            "posture": breakdown["posture"],
            "arm_movement": breakdown["arm_movement"],
            "leg_movement": breakdown["leg_movement"],
            "body_alignment": breakdown["body_alignment"],
            "running_technique": breakdown["running_technique"],
            "symmetry": breakdown["symmetry"],
            "movement_similarity": round(similarities.get("overall_movement_similarity", 0.0), 2),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations
        }
        
        report_path = os.path.join(self.output_dir, f"{os.path.splitext(video_filename)[0]}_assessment.json")
        with open(report_path, "w") as f:
            json.dump(assessment, f, indent=4)
            
        return assessment
