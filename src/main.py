import argparse
from utils.github_utils import get_github_code_files
from utils.file_utils import save_data_to_json
from utils.recommendation import recommend_snippets

def mine_mode(json_file: str):
    """Mines GitHub code and saves it to a JSON file."""
    print(f"Mining GitHub repositories and saving to {json_file}...")
    scraped_data = get_github_code_files(max_repos=10, max_files=30)
    save_data_to_json(scraped_data, json_file)
    print(f"Mining completed. Data saved to {json_file}.")

def search_mode(file_path: str, json_file: str):
    """Searches for similar code snippets using the mined data."""
    print(f"Searching for recommendations based on {file_path}...")
    recommended_snippets = recommend_snippets(file_path, json_file, N=5)
    
    print("\nRecommended Snippets:")
    for snippet in recommended_snippets:
        print(snippet["file_name"])

    save_data_to_json(recommended_snippets, "recommended.json")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GitHub Code Mining and Search System")
    parser.add_argument("-m", "--mode", choices=["mine", "search"], required=True, help="Mode: 'mine' or 'search'")
    parser.add_argument("-f", "--file", type=str, help="Currently open user editor file")
    parser.add_argument("-j", "--json", type=str, default="github_code_data.json", help="JSON file for storing/loading mined data")

    args = parser.parse_args()

    if args.mode == "mine":
        mine_mode(args.json)
    elif args.mode == "search":
        if not args.file:
            print("Error")
        else:
            search_mode(args.file, args.json)
