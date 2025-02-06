import * as vscode from "vscode";
import * as path from "path";
import { extractData } from "./extractData";
import { getSnippets } from "./getSnippets";

const SNIPPETS_FILE = path.join(__dirname, "../src", "snippets.json");

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "snippetReels.start",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Open a file to get snippet recommendations."
        );
        return;
      }

      const extractedData: Map<string, string[]> = extractData(editor.document);
      const snippets: string[] = getSnippets(SNIPPETS_FILE, extractedData);

      // Activity Bar에서 사용할 웹뷰를 생성하여 표시
      const panel = vscode.window.createWebviewPanel(
        "snippetReels",
        "Snippet Reels",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      // 웹뷰에 HTML 내용 설정
      panel.webview.html = getWebviewContent(snippets);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(snippets: string[] = []): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; text-align: center; }
        pre { background: rgb(83, 76, 76); padding: 10px; white-space: pre-wrap; }
        .container { height: 100vh; display: flex; flex-direction: column; justify-content: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <pre id="snippet">No snippets available</pre>
      </div>
      <script>
        const snippets = ${JSON.stringify(snippets)};
        let index = 0;
        function updateSnippet() {
          document.getElementById('snippet').textContent = snippets[index] || 'No snippets available';
        }
        function cycleSnippets() {
          setInterval(() => {
            index = (index + 1) % snippets.length;
            updateSnippet();
          }, 2000);
        }
        updateSnippet();
        cycleSnippets();
      </script>
    </body>
    </html>
  `;
}
