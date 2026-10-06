import os
import sys

# Change working directory to project root if executed from src
if os.path.basename(os.getcwd()) == 'src':
    os.chdir('..')

sys.path.append(os.path.join(os.path.dirname(__file__)))

from dataset_builder import DatasetBuilder
from train import ModelTrainer
from evaluate import Evaluator
from inference import InferencePipeline

def run_full_pipeline():
    print("========================================")
    print(" TalentTrack AI - End to End Pipeline")
    print("========================================")
    
    print("\n[1/4] Building Feature Dataset...")
    builder = DatasetBuilder(sample_rate=5) # use 5 for speed during testing
    df = builder.build()
    
    if df is None or len(df) == 0:
        print("Dataset build failed. Check dataset path and videos.")
        return
        
    print("\n[2/4] Training Models...")
    trainer = ModelTrainer()
    trainer.train()
    
    print("\n[3/4] Evaluating Models...")
    evaluator = Evaluator()
    evaluator.evaluate()
    
    print("\n[4/4] Testing Inference Pipeline...")
    pipeline = InferencePipeline()
    # Pick the first video to test inference
    test_video = df.iloc[0]['video_filename']
    video_path = os.path.join("assets", "Running Posture Analysis Dataset", test_video)
    
    if os.path.exists(video_path):
        result = pipeline.analyze_video(video_path)
        import json
        print("\n--- Final Assessment Result ---")
        print(json.dumps(result, indent=2))
        print("-------------------------------")
        print("Pipeline execution completed successfully.")
    else:
        print(f"Could not find test video at {video_path}")

if __name__ == "__main__":
    run_full_pipeline()
