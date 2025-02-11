from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from utils.file_utils import load_json_data, read_user_repo_files

# Define weights for different features
WEIGHTS = {
    "imports": 0.2,
    "functions": 0.3,
    "variables": 0.2,
    "source_code": 0.3
}

def generate_feature_text(data: Dict[str, Any], feature: str) -> str:
    """Creates a text representation of a specific feature for vectorization."""
    return " ".join(data.get(feature, []))

def recommend_snippets(file_path: str, db_filename: str, N: int = 5) -> List[Dict[str, Any]]:
    """Finds the top N recommended code snippets based on similarity."""
    db_data = load_json_data(db_filename)
    user_data = read_user_repo_files(file_path)

    if not user_data:
        print("No user data found.")
        return []

    # Identify the programming language of the user's current open file
    user_lang = user_data[0]["language"]
    print(f"Filtering recommendations for language: {user_lang}")

    # Filter database to match the same language
    filtered_db = [entry for entry in db_data if entry["language"] == user_lang]

    if not filtered_db:
        print("No matching language files found in the database.")
        return []

    # Prepare feature vectors
    feature_vectors = {feature: [] for feature in WEIGHTS.keys()}
    user_vectors = {feature: [] for feature in WEIGHTS.keys()}

    for feature in WEIGHTS.keys():
        vectorizer = TfidfVectorizer()
        db_texts = [generate_feature_text(entry, feature) for entry in filtered_db]
        user_texts = [generate_feature_text(entry, feature) for entry in user_data]

        all_texts = db_texts + user_texts
        if not all_texts:
            raise ValueError("No text found in database for similarity computation.")

        tfidf_matrix = vectorizer.fit_transform(all_texts)

        feature_vectors[feature] = tfidf_matrix[:len(filtered_db)]
        user_vectors[feature] = tfidf_matrix[len(filtered_db):]

    # Compute similarity scores for each feature
    scores = []
    for user_idx, _ in enumerate(user_data):
        file_scores = []
        for db_idx, _ in enumerate(filtered_db):
            total_score = sum(
                WEIGHTS[feature] * cosine_similarity(
                    user_vectors[feature][user_idx], feature_vectors[feature][db_idx]
                )[0][0]
                for feature in WEIGHTS.keys()
            )
            file_scores.append((db_idx, total_score))
        
        # Sort recommendations by highest total score
        file_scores.sort(key=lambda x: x[1], reverse=True)
        top_files = [filtered_db[idx]["file_name"] for idx, _ in file_scores[:N]]
        scores.extend(top_files)

    return scores[:N]
