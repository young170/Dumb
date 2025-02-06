import * as vscode from "vscode";

export function extractData(doc: vscode.TextDocument): Map<string, string[]> {
  const data = new Map<string, string[]>();

  // Extract basic information
  const language: string[] = [doc.languageId];
  const fileName = [doc.fileName];
  const sourceCode = [doc.getText()];

  // Initialize extracted components
  let importedLibraries: string[] = [];
  let functionNames: string[] = [];
  let variableNames: string[] = [];

  // Process based on language
  switch (doc.languageId) {
    case "typescript":
    case "javascript":
      ({ importedLibraries, functionNames, variableNames } = extractJSData(
        sourceCode[0]
      ));
      break;
    case "python":
      ({ importedLibraries, functionNames, variableNames } = extractPythonData(
        sourceCode[0]
      ));
      break;
    case "c":
    case "cpp":
      ({ importedLibraries, functionNames, variableNames } = extractCData(
        sourceCode[0]
      ));
      break;
    default:
      break;
  }

  data.set("language", language);
  data.set("fileName", fileName);
  data.set("sourceCode", sourceCode);
  data.set("importedLibraries", importedLibraries);
  data.set("functionNames", functionNames);
  data.set("variableNames", variableNames);

  return data;
}

function extractJSData(code: string): {
  importedLibraries: string[];
  functionNames: string[];
  variableNames: string[];
} {
  const importRegex = /import\s+(?:[^\n]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const functionRegex = /function\s+(\w+)/g;
  const variableRegex = /(?:var|let|const)\s+(\w+)/g;

  return extractMatches(code, importRegex, functionRegex, variableRegex);
}

function extractPythonData(code: string): {
  importedLibraries: string[];
  functionNames: string[];
  variableNames: string[];
} {
  const importRegex = /(?:import|from)\s+([^\s]+)/g;
  const functionRegex = /def\s+(\w+)/g;
  const variableRegex = /(\w+)\s*=\s*[^\n]+/g;

  return extractMatches(code, importRegex, functionRegex, variableRegex);
}

function extractCData(code: string): {
  importedLibraries: string[];
  functionNames: string[];
  variableNames: string[];
} {
  const importRegex = /#include\s+<([^>]+)>/g;
  const functionRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  const variableRegex =
    /\b(?:int|char|float|double|bool)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;

  return extractMatches(code, importRegex, functionRegex, variableRegex);
}

function extractMatches(
  code: string,
  importRegex: RegExp,
  functionRegex: RegExp,
  variableRegex: RegExp
): {
  importedLibraries: string[];
  functionNames: string[];
  variableNames: string[];
} {
  const importedLibraries = [...code.matchAll(importRegex)].map(
    (match) => match[1]
  );
  const functionNames = [...code.matchAll(functionRegex)].map(
    (match) => match[1]
  );
  const variableNames = [...code.matchAll(variableRegex)].map(
    (match) => match[1]
  );

  return { importedLibraries, functionNames, variableNames };
}
