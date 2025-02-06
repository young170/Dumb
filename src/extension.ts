// src/extension.ts
import * as vscode from "vscode";
import * as path from "path";
import { extractData } from "./extractData";
import { getSnippets } from "./getSnippets";

const SNIPPETS_FILE = path.join(__dirname, "../src", "snippets.json");

/**
 * extract data from editor file
 * rank-N code snippets from database
 * display
 * @param context
 */
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
      // get snippets based on the data
      const snippets: string[] = getSnippets(SNIPPETS_FILE, extractedData);
      // display
      SnippetReelPanel.displayReels(context.extensionUri, snippets);
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

// Display
class SnippetReelPanel {
  public static currentPanel: SnippetReelPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    snippets: string[],
    extensionUri: vscode.Uri
  ) {
    this.panel = panel;
    this.updateWebview(snippets);
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  public static displayReels(extensionUri: vscode.Uri, snippets: string[]) {
    if (SnippetReelPanel.currentPanel) {
      SnippetReelPanel.currentPanel.updateWebview(snippets);
      SnippetReelPanel.currentPanel.panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "snippetReels",
        "Snippet Reels",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      SnippetReelPanel.currentPanel = new SnippetReelPanel(
        panel,
        snippets,
        extensionUri
      );
    }
  }

  private updateWebview(snippets: string[]) {
    this.panel.webview.html = this.getWebviewContent(snippets);
  }

  private getWebviewContent(snippets: string[]): string {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; text-align: center; }
                    pre { background:rgb(83, 76, 76); padding: 10px; white-space: pre-wrap; }
                    .container { height: 100vh; display: flex; flex-direction: column; justify-content: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <pre id="snippet"></pre>
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
            </html>`;
  }

  public dispose() {
    SnippetReelPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
