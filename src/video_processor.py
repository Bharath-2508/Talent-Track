import cv2
import os
import json
from typing import Dict, Any, Generator, Tuple
import numpy as np

class VideoProcessor:
    def __init__(self, target_size: Tuple[int, int] = (640, 480)):
        self.target_size = target_size

    def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """
        Extract metadata from a video file.
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            return {"status": "error", "message": "Failed to open video file."}

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if fps > 0:
            duration = frame_count / fps
        else:
            duration = 0.0
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        cap.release()

        return {
            "status": "success",
            "fps": fps,
            "frame_count": frame_count,
            "duration": duration,
            "resolution": (width, height)
        }

    def frame_generator(self, video_path: str, sample_rate: int = 1) -> Generator[Tuple[int, np.ndarray], None, None]:
        """
        Generator to yield frames one by one to avoid memory overload.
        sample_rate: Extracts every Nth frame.
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Error opening video {video_path}")
            return
            
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % sample_rate == 0:
                if self.target_size:
                    frame = cv2.resize(frame, self.target_size)
                yield frame_idx, frame
                
            frame_idx += 1
            
        cap.release()

    def process_dataset(self, videos: list, sample_rate: int = 1, output_report: str = "outputs/dataset_report.json"):
        """
        Process a list of videos, collecting metadata and detecting corrupted files.
        """
        os.makedirs(os.path.dirname(output_report), exist_ok=True)
        
        report: Dict[str, Any] = {
            "total_videos": len(videos),
            "successfully_processed": 0,
            "failed_videos": 0,
            "videos": []
        }
        
        for video in videos:
            info = self.get_video_info(video["path"])
            video_report = {
                "filename": video["filename"],
                "path": video["path"],
                "category": video["category"]
            }
            video_report.update(info)
            
            if info.get("status") == "success":
                report["successfully_processed"] += 1
            else:
                report["failed_videos"] += 1
                
            report["videos"].append(video_report)
            
        with open(output_report, "w") as f:
            json.dump(report, f, indent=4)
            
        return report

if __name__ == "__main__":
    from dataset_loader import DatasetLoader
    
    loader = DatasetLoader()
    vids = loader.scan_dataset()
    
    processor = VideoProcessor()
    report = processor.process_dataset(vids[:5])
    print(json.dumps(report, indent=2))
