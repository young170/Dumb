import numpy as np
from typing import List, Dict, Any
from utils.file_utils import load_json_data, read_user_file

# Define weights for different features
WEIGHTS = {
    "imports": 0.35,
    "functions": 0.4,
    "variables": 0.2,
    "source_code": 0.05
}

def jaccard_similarity(str1, str2):
    set1, set2 = set(str1.split()), set(str2.split())
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union else 0.0

def compute_similarity(user_feature: List[str], db_feature: List[str]) -> float:
    """Computes cosine similarity between two lists of strings."""
    if not user_feature or not db_feature:
        return 0.0
    
    return np.mean([[jaccard_similarity(a, b) for b in db_feature] for a in user_feature])

def recommend_snippets(file_path: str, db_filename: str, N: int = 5) -> List[Dict[str, Any]]:
    """Finds the top N recommended code snippets based on similarity."""
    db_data = load_json_data(db_filename)
    user_data = read_user_file(file_path)

    if not user_data:
        print("No user data found.")
        return []

    user_lang = user_data[0]["language"]
    filtered_db = [entry for entry in db_data if entry["language"] == user_lang]

    if not filtered_db:
        print("No matching language files found in the database.")
        return []
    
    recommendations = []
    for entry in filtered_db:
        total_score = 0
        for feature in WEIGHTS.keys():
            user_feature = user_data[0].get(feature, [])
            db_feature = entry.get(feature, [])

            similarity = compute_similarity(user_feature, db_feature)
            total_score += WEIGHTS[feature] * similarity

        recommendations.append({"file_name": entry["file_name"], "score": total_score, "source_code": entry["source_code"]})

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:N]
