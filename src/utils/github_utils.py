import os
import requests
from dotenv import load_dotenv
from github import Github
from typing import List, Dict, Any
from utils.code_utils import extract_code_features, get_file_lang, remove_comments

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"}
g = Github(GITHUB_TOKEN)

def fetch_files_recursive(repo: str, path: str = "") -> List[Dict[str, Any]]:
    """Recursively fetches all code files from a GitHub repository."""
    extracted_data = []
    contents_url = f"https://api.github.com/repos/{repo}/contents/{path}"
    contents_response = requests.get(contents_url, headers=HEADERS)

    if contents_response.status_code == 200:
        for file in contents_response.json():
            if file["type"] == "file":
                filename = file["name"]
                language = get_file_lang(filename)

                if language == "unknown":
                    print(f"Skipped file: {filename}")
                    continue

                print(f"Processing file: {filename}")
                download_url = file.get("download_url")

                if download_url:
                    file_response = requests.get(download_url)
                    if file_response.status_code == 200:
                        file_content = file_response.text
                        cleaned_code = remove_comments(file_content, language)

                        extracted_data.append({
                            "file_name": filename,
                            "language": language,
                            "source_code": cleaned_code,
                            **extract_code_features(cleaned_code, language),
                        })

            elif file["type"] == "dir":
                # Recursively process the directory
                extracted_data.extend(fetch_files_recursive(repo, file["path"]))

    return extracted_data

def get_github_code_files(repo_list: List[str]) -> List[Dict[str, Any]]:
    """Fetches GitHub code files from multiple repositories, recursively handling directories."""
    all_extracted_data = []
    for repo in repo_list: # for each repo in the list of repos
        print(f"Fetching files from repository: {repo}")
        # starts from the root path, which is ""
        all_extracted_data.extend(fetch_files_recursive(repo)) # add to end of List
    
    return all_extracted_data
