import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

class ModelTrainer:
    def __init__(self, data_path: str = "data/features/running_features.csv"):
        self.data_path = data_path
        self.model_dir = "models"
        os.makedirs(self.model_dir, exist_ok=True)
        
    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Error: {self.data_path} not found.")
            return None
        return pd.read_csv(self.data_path)

    def train(self):
        df = self.load_data()
        if df is None: return

        print(f"Loaded {len(df)} videos for training.")
        
        # Split at VIDEO level (which is inherently the case since each row is a video)
        # We use a standard train/val/test split 70/15/15
        
        # Determine if we have a valid classification target
        # For this dataset, categories might just be 'uncategorized'. 
        # If so, we build an unsupervised reference model (Isolation Forest).
        
        has_labels = df['category'].nunique() > 1 and 'uncategorized' not in df['category'].unique()
        
        features = df.drop(columns=['video_filename', 'category', 'detection_rate'])
        feature_names = features.columns.tolist()
        
        # Ensure splits don't leak videos by simply splitting the dataframe
        if len(df) < 5:
            train_df = df
            val_df = df
            test_df = df
        else:
            train_df, temp_df = train_test_split(df, test_size=0.3, random_state=42)
            val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=42)
        
        print(f"Training videos: {len(train_df)}")
        print(f"Validation videos: {len(val_df)}")
        print(f"Testing videos: {len(test_df)}")

        X_train = train_df[feature_names]
        X_val = val_df[feature_names]
        X_test = test_df[feature_names]
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)
        X_test_scaled = scaler.transform(X_test)
        
        joblib.dump(scaler, os.path.join(self.model_dir, "scaler.pkl"))
        joblib.dump(feature_names, os.path.join(self.model_dir, "feature_names.pkl"))
        
        # Create Reference Features for Comparison Pipeline (Phase 11)
        # We define reference features as the mean of the training set
        reference_features = X_train.mean().to_dict()
        joblib.dump(reference_features, os.path.join(self.model_dir, "reference_features.pkl"))

        metrics = {}
        
        if has_labels:
            print("Categories found. Training classification model...")
            y_train = train_df['category']
            y_val = val_df['category']
            
            clf = RandomForestClassifier(n_estimators=100, random_state=42)
            clf.fit(X_train_scaled, y_train)
            
            y_pred = clf.predict(X_val_scaled)
            metrics = {
                "accuracy": accuracy_score(y_val, y_pred),
                "precision": precision_score(y_val, y_pred, average='weighted', zero_division=0),
                "recall": recall_score(y_val, y_pred, average='weighted', zero_division=0),
                "f1": f1_score(y_val, y_pred, average='weighted', zero_division=0)
            }
            print("Validation Metrics:")
            for k, v in metrics.items():
                print(f"  {k}: {v:.4f}")
                
            joblib.dump(clf, os.path.join(self.model_dir, "running_model.pkl"))
            
        else:
            print("No labels found. Training unsupervised anomaly/reference model...")
            # We learn the "normal" distribution of running in the training set
            iso = IsolationForest(contamination=0.1, random_state=42)
            iso.fit(X_train_scaled)
            
            # Val evaluation just checks how many are considered normal
            y_pred_val = iso.predict(X_val_scaled)
            normal_ratio = sum(y_pred_val == 1) / len(y_pred_val)
            metrics = {"val_normal_ratio": normal_ratio}
            
            print(f"Validation Normal Ratio (similarity to train): {normal_ratio:.2%}")
            joblib.dump(iso, os.path.join(self.model_dir, "running_model.pkl"))
            
        metadata = {
            "model_type": "RandomForest" if has_labels else "IsolationForest",
            "has_labels": has_labels,
            "metrics": metrics,
            "training_samples": len(train_df),
            "features_used": len(feature_names)
        }
        
        import json
        with open(os.path.join(self.model_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=4)
            
        print("Model and artifacts saved successfully in models/")

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train()
