import sys
sys.path.append(r"d:\TalentTrack-AI\backend")
from app.ai.running_analyzer import analyze_video

v1 = r"d:\TalentTrack-AI\assets\Running Posture Analysis Dataset\Axl-10kmh - Trim_norm.MOV"
v2 = r"d:\TalentTrack-AI\assets\Running Posture Analysis Dataset\Runner1 - 9km_h - Trim_norm.MOV"

print("Analyzing v1...")
res1 = analyze_video(v1)
print(f"V1 Overall Score: {res1['overall_score']}")
print(f"V1 Metrics: {res1['metrics']}")

print("Analyzing v2...")
res2 = analyze_video(v2)
print(f"V2 Overall Score: {res2['overall_score']}")
print(f"V2 Metrics: {res2['metrics']}")
