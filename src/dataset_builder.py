import os
import json
import pandas as pd
from video_processor import VideoProcessor
from pose_estimator import PoseEstimator
from feature_extractor import FeatureExtractor
from dataset_loader import DatasetLoader

class DatasetBuilder:
    def __init__(self, sample_rate: int = 3):
        self.loader = DatasetLoader()
        self.processor = VideoProcessor()
        self.pose_estimator = PoseEstimator()
        self.feature_extractor = FeatureExtractor()
        self.sample_rate = sample_rate

    def build(self, output_path: str = "data/features/running_features.csv"):
        videos = self.loader.scan_dataset()
        if not videos:
            print("No videos found to process.")
            return

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        all_features = []
        for i, video in enumerate(videos):
            print(f"Processing {i+1}/{len(videos)}: {video['filename']}")
            
            # Use generator to process frames
            frame_gen = self.processor.frame_generator(video['path'], sample_rate=self.sample_rate)
            
            # Extract poses
            pose_data = self.pose_estimator.extract_video_poses(frame_gen)
            
            if pose_data["detection_rate"] > 10.0:  # Valid if at least some frames have human detected
                # Aggregate to video-level features
                video_features = self.feature_extractor.aggregate_video_features(pose_data["frames"])
                if video_features:
                    video_features["video_filename"] = video['filename']
                    video_features["category"] = video['category']
                    video_features["detection_rate"] = pose_data["detection_rate"]
                    all_features.append(video_features)
            else:
                print(f"Skipping {video['filename']} due to low detection rate ({pose_data['detection_rate']}%).")
                
        if all_features:
            df = pd.DataFrame(all_features)
            df.to_csv(output_path, index=False)
            print(f"Saved extracted features for {len(df)} videos to {output_path}")
            return df
        return None

if __name__ == "__main__":
    builder = DatasetBuilder(sample_rate=5) # Process every 5th frame for speed
    builder.build()
