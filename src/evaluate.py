import os
import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from scipy.spatial.distance import cosine, euclidean

class Evaluator:
    def __init__(self, data_path: str = "data/features/running_features.csv", model_dir: str = "models"):
        self.data_path = data_path
        self.model_dir = model_dir

    def evaluate(self):
        df = pd.read_csv(self.data_path)
        
        # Load models
        scaler_path = os.path.join(self.model_dir, "scaler.pkl")
        model_path = os.path.join(self.model_dir, "running_model.pkl")
        metadata_path = os.path.join(self.model_dir, "metadata.json")
        ref_features_path = os.path.join(self.model_dir, "reference_features.pkl")
        
        if not all(os.path.exists(p) for p in [scaler_path, model_path, metadata_path, ref_features_path]):
            print("Models not found. Please train the model first.")
            return
            
        scaler = joblib.load(scaler_path)
        model = joblib.load(model_path)
        feature_names = joblib.load(os.path.join(self.model_dir, "feature_names.pkl"))
        reference_features = joblib.load(ref_features_path)
        
        import json
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            
        print("--- Model Evaluation ---")
        print(f"Model Type: {metadata['model_type']}")
        
        # Simple test evaluation since we used all data for train/val/test in train.py 
        # (in practice we would save the test set indices, here we just evaluate on the whole set for demonstration)
        X = df[feature_names]
        X_scaled = scaler.transform(X)
        
        if metadata['has_labels']:
            y = df['category']
            y_pred = model.predict(X_scaled)
            from sklearn.metrics import accuracy_score
            acc = accuracy_score(y, y_pred)
            print(f"Overall Accuracy: {acc:.4f}")
        else:
            # Anomaly/reference
            preds = model.predict(X_scaled)
            print(f"Overall Normal Ratio: {sum(preds == 1) / len(preds):.2%}")
            
        print("Evaluation complete.")

if __name__ == "__main__":
    evaluator = Evaluator()
    evaluator.evaluate()
