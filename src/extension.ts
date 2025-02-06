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
  // 웹뷰 패널을 보여주는 명령어를 삭제합니다. (기존의 onCommand는 필요없음)

  // `onView` 이벤트를 통해 뷰가 활성화될 때 웹뷰를 표시하도록 합니다.
  vscode.window.registerWebviewViewProvider(
    "dumbWebview",
    new SnippetReelPanelProvider(context.extensionUri)
  );
}

export function deactivate() {}

// 웹뷰를 띄우는 새로운 클래스입니다.
class SnippetReelPanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private readonly extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  // 뷰가 처음 활성화될 때 호출됩니다.
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    // 웹뷰에 필요한 초기 설정을 합니다.
    this._view.webview.options = {
      enableScripts: true,
    };

    // 데이터를 추출하여 스니펫을 가져옵니다.
    const snippets = this.getSnippets();
    this.updateWebview(snippets);
  }

  // 스니펫을 가져오는 로직입니다.
  private getSnippets(): string[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found.");
      return [];
    }

    const extractedData: Map<string, string[]> = extractData(editor.document);
    const snippets: string[] = getSnippets(SNIPPETS_FILE, extractedData); // 수정된 부분

    console.log("Extracted Snippets:", snippets);
    return snippets;
  }

  // 웹뷰 내용을 업데이트하는 함수입니다.
  private updateWebview(snippets: string[]) {
    if (!this._view) return;

    this._view.webview.html = this.getWebviewContent(snippets);
  }

  // 웹뷰의 HTML 콘텐츠를 반환합니다.
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
}
