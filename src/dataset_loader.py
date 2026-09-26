import os
from pathlib import Path
from typing import List, Dict

class DatasetLoader:
    def __init__(self, dataset_path: str = "assets/Running Posture Analysis Dataset"):
        self.dataset_path = Path(dataset_path)
        self.supported_extensions = {".mp4", ".avi", ".mov", ".mkv"}

    def scan_dataset(self) -> List[Dict[str, str]]:
        """
        Recursively scans the dataset directory for supported video files.
        Returns a list of dictionaries containing video paths and categories (if any).
        """
        videos = []
        if not self.dataset_path.exists():
            print(f"Warning: Dataset path {self.dataset_path} does not exist.")
            return videos

        for file_path in self.dataset_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in self.supported_extensions:
                # Relative path parts can be used to infer category or athlete
                rel_path = file_path.relative_to(self.dataset_path)
                category = rel_path.parent.name if rel_path.parent.name else "uncategorized"
                
                videos.append({
                    "path": str(file_path.absolute()),
                    "filename": file_path.name,
                    "category": category,
                    "relative_path": str(rel_path)
                })
                
        print(f"Found {len(videos)} supported video files in {self.dataset_path}, using only first 3 for quick setup.")
        return videos[:3]

if __name__ == "__main__":
    loader = DatasetLoader()
    vids = loader.scan_dataset()
    for v in vids[:5]:
        print(v)
