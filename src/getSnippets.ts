import * as fs from "fs";

interface Snippet {
  language: string;
  code: string;
}

export function getSnippets(
  snippetsFile: string,
  extractedData: Map<string, string[]>
): string[] {
  if (extractedData.size <= 0) {
    return [];
  }

  try {
    // Read and parse the JSON file
    const data = fs.readFileSync(snippetsFile, "utf-8");
    const snippets: Snippet[] = JSON.parse(data);

    // Filter snippets matching the specified language
    return snippets
      .filter(
        (snippet) =>
          snippet.language.toLowerCase() ===
          extractedData.get("language")?.at(0)?.toLowerCase()
      )
      .map((snippet) => snippet.code);
  } catch (error) {
    console.error("Error reading snippets file:", error);
    return [];
  }
}
