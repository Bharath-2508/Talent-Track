import os
import joblib
from video_processor import VideoProcessor
from pose_estimator import PoseEstimator
from feature_extractor import FeatureExtractor
from comparison import Comparer
from scoring import Scorer
from report_generator import ReportGenerator

DEFAULT_REFERENCE_FEATURES = {
    'left_knee_angle_mean': 120.6, 'left_knee_angle_std': 30.8, 'left_knee_angle_min': 45.5, 'left_knee_angle_max': 174.1, 'left_knee_angle_range': 128.6,
    'right_knee_angle_mean': 108.8, 'right_knee_angle_std': 26.6, 'right_knee_angle_min': 56.0, 'right_knee_angle_max': 161.3, 'right_knee_angle_range': 105.3,
    'left_hip_angle_mean': 133.4, 'left_hip_angle_std': 28.0, 'left_hip_angle_min': 87.5, 'left_hip_angle_max': 179.5, 'left_hip_angle_range': 91.9,
    'right_hip_angle_mean': 119.3, 'right_hip_angle_std': 27.9, 'right_hip_angle_min': 77.5, 'right_hip_angle_max': 179.2, 'right_hip_angle_range': 101.7,
    'left_elbow_angle_mean': 105.9, 'left_elbow_angle_std': 28.7, 'left_elbow_angle_min': 41.9, 'left_elbow_angle_max': 171.8, 'left_elbow_angle_range': 129.9,
    'right_elbow_angle_mean': 69.1, 'right_elbow_angle_std': 13.0, 'right_elbow_angle_min': 35.6, 'right_elbow_angle_max': 122.2, 'right_elbow_angle_range': 86.5,
    'left_ankle_angle_mean': 121.8, 'left_ankle_angle_std': 22.6, 'left_ankle_angle_min': 41.8, 'left_ankle_angle_max': 179.4, 'left_ankle_angle_range': 137.6,
    'right_ankle_angle_mean': 111.3, 'right_ankle_angle_std': 15.8, 'right_ankle_angle_min': 71.7, 'right_ankle_angle_max': 155.6, 'right_ankle_angle_range': 83.8,
    'body_lean_angle_mean': 26.6, 'body_lean_angle_std': 4.9, 'body_lean_angle_min': 12.8, 'body_lean_angle_max': 42.7, 'body_lean_angle_range': 29.8,
    'knee_angle_diff_mean': 26.6, 'knee_angle_diff_std': 22.0, 'knee_angle_diff_min': 0.2, 'knee_angle_diff_max': 87.2, 'knee_angle_diff_range': 87.0,
    'elbow_angle_diff_mean': 40.1, 'elbow_angle_diff_std': 24.5, 'elbow_angle_diff_min': 0.9, 'elbow_angle_diff_max': 121.1, 'elbow_angle_diff_range': 120.2,
    'stride_width_norm_mean': 0.24, 'stride_width_norm_std': 0.15, 'stride_width_norm_min': 0.007, 'stride_width_norm_max': 0.51, 'stride_width_norm_range': 0.50,
    'arm_swing_norm_mean': 0.10, 'arm_swing_norm_std': 0.05, 'arm_swing_norm_min': 0.009, 'arm_swing_norm_max': 0.25, 'arm_swing_norm_range': 0.24,
    'movement_consistency': 0.05, 'posture_stability': 0.22, 'knee_lift_metric': 128.6, 'overall_symmetry': 0.03
}

class InferencePipeline:
    def __init__(self, model_dir: str = "models", output_dir: str = "outputs"):
        self.model_dir = model_dir
        self.output_dir = output_dir
        
        self.processor = VideoProcessor()
        self.pose_estimator = PoseEstimator()
        self.feature_extractor = FeatureExtractor()
        self.comparer = Comparer()
        self.scorer = Scorer()
        self.report_generator = ReportGenerator(output_dir=self.output_dir)
        
        # Load models
        self.load_models()

    def load_models(self):
        candidate_dirs = [
            self.model_dir,
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models")),
            os.path.abspath(os.path.join(os.getcwd(), "models")),
            os.path.abspath(os.path.join(os.getcwd(), "..", "models")),
        ]
        
        for m_dir in candidate_dirs:
            if not m_dir or not os.path.exists(m_dir):
                continue
            try:
                scaler_path = os.path.join(m_dir, "scaler.pkl")
                model_path = os.path.join(m_dir, "running_model.pkl")
                feat_path = os.path.join(m_dir, "feature_names.pkl")
                ref_path = os.path.join(m_dir, "reference_features.pkl")
                
                if os.path.exists(scaler_path) and os.path.exists(model_path) and os.path.exists(feat_path) and os.path.exists(ref_path):
                    self.scaler = joblib.load(scaler_path)
                    self.model = joblib.load(model_path)
                    self.feature_names = joblib.load(feat_path)
                    self.reference_features = joblib.load(ref_path)
                    self.model_dir = m_dir
                    return True
            except Exception as e:
                print(f"Warning: Error loading models from {m_dir}: {e}")

        # Fallback to built-in reference features to ensure analysis never fails
        print("Using built-in reference biomechanical features fallback.")
        self.reference_features = DEFAULT_REFERENCE_FEATURES
        self.feature_names = list(DEFAULT_REFERENCE_FEATURES.keys())
        return True

    def analyze_video(self, video_path: str):
        if not hasattr(self, 'reference_features'):
            self.load_models()

        if not os.path.exists(video_path):
            return {"error": "Video file not found."}
            
        filename = os.path.basename(video_path)
        print(f"Analyzing {filename}...")
        
        # 1. Preprocessing & Pose Extraction
        frame_gen = self.processor.frame_generator(video_path, sample_rate=3)
        pose_data = self.pose_estimator.extract_video_poses(frame_gen)
        
        if pose_data["detection_rate"] < 15.0:
            return {"error": f"Invalid practice video: Low pose detection rate ({pose_data['detection_rate']:.1f}%). Ensure athlete full body is clearly visible in frame."}
            
        # 2. Feature Extraction
        video_features = self.feature_extractor.aggregate_video_features(pose_data["frames"])
        if not video_features:
            return {"error": "Invalid practice video: Failed to extract biomechanical features."}

        # 3. Validate running motion (Knee angle range & stride displacement)
        knee_range = video_features.get("knee_lift_metric", 0)
        stride_std = video_features.get("stride_width_norm_std", 0)
        if knee_range < 12.0 and stride_std < 0.003:
            return {"error": "Invalid practice video: Human running motion not detected. Video shows static pose or non-running movement. Please upload a clear practice video of an athlete running or sprinting."}
            
        # Prepare feature vector for ML model (if needed for ML-based score prediction)
        # We rely on similarities for the out of 100 score as requested for this project
        
        # 3. Compare with Reference
        similarities = self.comparer.compute_similarity(video_features, self.reference_features)
        
        # 4. Generate Score
        score_data = self.scorer.generate_score(video_features, similarities)
        
        # 5. Generate Report
        assessment = self.report_generator.generate_report(
            filename, 
            pose_data["detection_rate"], 
            score_data, 
            similarities
        )
        
        return assessment

if __name__ == "__main__":
    # Test on a dummy or existing video
    import sys
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
    else:
        video_path = "assets/Running Posture Analysis Dataset/Axl-10kmh - Trim_norm.MOV"
        
    pipeline = InferencePipeline()
    result = pipeline.analyze_video(video_path)
    
    import json
    print(json.dumps(result, indent=2))
