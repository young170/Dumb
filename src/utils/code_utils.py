import re
from typing import Dict, Any

def extract_code_features(code: str, language: str) -> Dict[str, Any]:
    """Extracts imported libraries, function names, and variable names from code."""
    imports, functions, variables = [], [], []

    if language == "python":
        imports = re.findall(r"(?:import|from)\s+([\w\.]+)", code)
        functions = re.findall(r"def\s+([\w_]+)\(", code)
        variables = re.findall(r"(\w+)\s*=\s*.+", code)

    elif language == "java":
        imports = re.findall(r"import\s+([\w\.]+);", code)
        functions = re.findall(r"public\s+\w+\s+([\w_]+)\s*\(|private\s+\w+\s+([\w_]+)\s*\(", code)
        functions = [f for match in functions for f in match if f]
        variables = re.findall(r"(?:\w+\s+)?(\w+)\s*=\s*.+;", code)

    elif language == "cpp" or language == "c":
        imports = re.findall(r"#include\s+[<\"]([\w\.]+)[>\"]", code)
        functions = re.findall(r"\w+\s+([\w_]+)\s*\(.*\)\s*\{", code)
        variables = re.findall(r"(\w+)\s*=\s*.+;", code)

    return {
        "imports": list(set(imports)),
        "functions": list(set(functions)),
        "variables": list(set(variables)),
    }

def get_file_lang(filename: str) -> str:
    """Determines programming language from filename."""
    if filename.endswith(".py"):
        return "python"
    elif filename.endswith(".java"):
        return "java"
    elif filename.endswith((".cpp", ".hpp", ".cxx")):
        return "cpp"
    elif filename.endswith((".c")):
        return "c"
    return "unknown"
