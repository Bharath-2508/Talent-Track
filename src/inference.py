import os
import joblib
from video_processor import VideoProcessor
from pose_estimator import PoseEstimator
from feature_extractor import FeatureExtractor
from comparison import Comparer
from scoring import Scorer
from report_generator import ReportGenerator

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
        try:
            self.scaler = joblib.load(os.path.join(self.model_dir, "scaler.pkl"))
            self.model = joblib.load(os.path.join(self.model_dir, "running_model.pkl"))
            self.feature_names = joblib.load(os.path.join(self.model_dir, "feature_names.pkl"))
            self.reference_features = joblib.load(os.path.join(self.model_dir, "reference_features.pkl"))
            return True
        except Exception as e:
            print(f"Warning: Failed to load models. Error: {e}. Please train the model first.")
            return False

    def analyze_video(self, video_path: str):
        if not hasattr(self, 'reference_features'):
            if not self.load_models():
                return {"error": "Models are not trained yet. Please run the training pipeline first."}

        if not os.path.exists(video_path):
            return {"error": "Video file not found."}
            
        filename = os.path.basename(video_path)
        print(f"Analyzing {filename}...")
        
        # 1. Preprocessing & Pose Extraction
        frame_gen = self.processor.frame_generator(video_path, sample_rate=3)
        pose_data = self.pose_estimator.extract_video_poses(frame_gen)
        
        if pose_data["detection_rate"] < 10.0:
            return {"error": f"Failed to detect human pose reliably. Detection rate: {pose_data['detection_rate']}%"}
            
        # 2. Feature Extraction
        video_features = self.feature_extractor.aggregate_video_features(pose_data["frames"])
        if not video_features:
            return {"error": "Failed to aggregate features."}
            
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
        video_path = "assests/Running Posture Analysis Dataset/Axl-10kmh - Trim_norm.MOV"
        
    pipeline = InferencePipeline()
    result = pipeline.analyze_video(video_path)
    
    import json
    print(json.dumps(result, indent=2))
