import * as vscode from "vscode";
import * as path from "path";
import { extractData } from "./extractData";
import { getSnippets } from "./getSnippets";

const SNIPPETS_FILE = path.join(__dirname, "../src", "snippets.json");

export function activate(context: vscode.ExtensionContext) {
  const provider = new SnippetReelWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("dumbWebview", provider)
  );

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
      provider.updateSnippets(snippets);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

class SnippetReelWebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _snippets: string[] = [];

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    this.updateWebview();
  }

  public updateSnippets(snippets: string[]) {
    this._snippets = snippets;
    this.updateWebview();
  }

  private updateWebview() {
    if (this._view) {
      this._view.webview.html = this.getWebviewContent();
    }
  }

  private getWebviewContent(): string {
    // style.css 파일의 경로를 webview에서 로드할 수 있는 URI로 변환
    const styleUri = this._view?.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "src", "style.css")
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <!-- style.css 파일을 웹뷰에 링크 -->
          <link rel="stylesheet" type="text/css" href="${styleUri}">
      </head>
      <body>
          <div class="container">
              <pre id="snippet"></pre>
          </div>
          <script>
              const snippets = ${JSON.stringify(this._snippets)};
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
}
