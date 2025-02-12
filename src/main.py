import argparse
import json
from utils.github_utils import get_github_code_files
from utils.file_utils import save_data_to_json
from utils.recommendation import recommend_snippets

def mine_mode(json_file: str):
    """Mines GitHub code and saves it to a JSON file."""
    repo_list = ["RyanFehr/HackerRank", "jsquared21/Intro-to-Java-Programming", "knightsj/awesome-algorithm-question-solution",
                 "cy69855522/Shortest-LeetCode-Python-Solutions", "gzwl/leetcode", "tech-cow/leetcode",
                 "manishbisht/Competitive-Programming", "wuduhren/leetcode-python", "Garvit244/Leetcode",
                 "nayuki/Project-Euler-solutions", "SamirPaulb/DSAlgo", "csujedihy/lc-all-solutions",
                 "jimmysuncpt/Algorithms", "reneargento/algorithms-sedgewick-wayne", "gouthampradhan/leetcode",
                 "MTrajK/coding-problems", "pedrovgs/Algorithms", "liuyubobobo/Play-Leetcode",
                 "pezy/CppPrimer", "kamyu104/LeetCode-Solutions", "awangdev/leet-code",
                 "fishercoder1534/Leetcode", "pezy/LeetCode", "sherxon/AlgoDS",
                 "Blankj/awesome-java-leetcode", "grandyang/leetcode", "neetcode-gh/leetcode",
                 "wisdompeak/LeetCode", "qiyuangong/leetcode", "haoel/leetcode",
                 "doocs/leetcode"]
    scraped_data = get_github_code_files(repo_list)
    save_data_to_json(scraped_data, json_file)

def search_mode(file_path: str, json_file: str):
    """Searches for similar code snippets using the mined data."""
    recommended_snippets = recommend_snippets(file_path, json_file, N=3)
    source_codes = [snippet["source_code"] for snippet in recommended_snippets]
    print(json.dumps(source_codes))

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
