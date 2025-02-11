import os
import requests
from dotenv import load_dotenv
from github import Github
from typing import List, Dict, Any
from utils.code_utils import extract_code_features, get_file_lang

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")

HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"}
g = Github(GITHUB_TOKEN)

def get_github_code_files(max_repos: int = 10, max_files: int = 10) -> List[Dict[str, Any]]:
    """Fetches GitHub code files and extracts features."""
    extracted_data = []
    list_of_langs = ["python", "java", "cpp", "c"]

    for lang in list_of_langs:
      starred_repos_url = f"https://api.github.com/search/repositories?q=language:{lang}&sort=stars&order=desc"
      response = requests.get(starred_repos_url, headers=HEADERS)
      
      if response.status_code != 200:
          print(f"Error fetching data: {response.json()}")
          return []
      
      repos = response.json().get("items", [])

      for repo in repos[:max_repos]:
          repo_name = repo["full_name"]
          contents_url = f"https://api.github.com/repos/{repo_name}/contents"
          contents_response = requests.get(contents_url, headers=HEADERS)

          if contents_response.status_code == 200:
              for file in contents_response.json()[:max_files]:
                  if file["type"] == "file":
                      filename = file.get("name")
                      language = get_file_lang(filename)
                      if language == "unknown":
                        continue

                      download_url = file.get("download_url")
                      if download_url:
                          file_content = requests.get(download_url).text

                          extracted_data.append({
                              "file_name": filename,
                              "language": language,
                              "source_code": file_content,
                              **extract_code_features(file_content, language),
                          })
    
    return extracted_data
