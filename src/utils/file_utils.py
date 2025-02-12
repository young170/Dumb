import os
import json
from typing import List, Dict, Any
from utils.code_utils import extract_code_features, get_file_lang

def read_user_file(file_path: str) -> List[Dict[str, Any]]:
    """Reads file and extracts code features."""
    user_data = []
    language = get_file_lang(file_path)

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        source_code = f.read()
        user_data.append({
            "file_name": file_path,
            "language": language,
            "source_code": source_code,
            **extract_code_features(source_code, language),
        })
        f.close()
    return user_data

def save_data_to_json(data: List[Dict[str, Any]], filename: str):
    """Saves data to a JSON file."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_json_data(filename: str) -> List[Dict[str, Any]]:
    """Loads JSON data from file."""
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)
