import os
import sys
import json

# Ensure backend directory is in sys.path for app.* imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.ai.running_analyzer import analyze_video
from app.ai.report_builder import build_report

def run_analysis_and_generate_report(video_path: str, athlete_name: str = "Athlete"):
    print(f"Analyzing video: {video_path}...")
    analyzer_result = analyze_video(video_path)
    
    previous_scores = [55, 58, 62]  # Historical progression for chart
    
    report = build_report(
        analyzer_result=analyzer_result,
        previous_scores=previous_scores,
        athlete_name=athlete_name
    )
    
    # Write to output file
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "latest_athlete_report.json")
    
    with open(out_file, "w") as f:
        json.dump(report, f, indent=4)
        
    print(f"Report saved to {out_file}")
    return report

if __name__ == "__main__":
    video = os.path.join("assets", "Running Posture Analysis Dataset", "Runner1 - 9km_h - Trim_norm.MOV")
    if len(sys.argv) > 1:
        video = sys.argv[1]
    
    rep = run_analysis_and_generate_report(video, athlete_name="Runner 1")
    print("\n=== ATHLETE BIOMECHANICAL ANALYSIS REPORT ===")
    print(json.dumps(rep, indent=2))
