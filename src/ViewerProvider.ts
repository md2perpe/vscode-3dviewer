import * as path from 'path';
import * as vscode from 'vscode';

class MeshDocument implements vscode.CustomDocument {
    constructor(public uri: vscode.Uri)
    {
    }

    dispose()
    {
        // TODO
    }
}

export default class ViewerProvider implements vscode.CustomReadonlyEditorProvider<MeshDocument>
{
    constructor(private context: vscode.ExtensionContext)
    {

    }

    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): MeshDocument // | Thenable<MeshDocument>
    {
        return new MeshDocument(uri);
    }

    resolveCustomEditor(document: MeshDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void // | Thenable<void>
    {
        const cspSource = webviewPanel.webview.cspSource;

        let nonce = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        // Helper function
        const self = this;
        function buildUri(relativePath: string) {
            return webviewPanel.webview.asWebviewUri(
                vscode.Uri.file(
                    path.join(self.context.extensionPath, relativePath)
                )
            );
        }

        const scripts = [
            "js/three.js",
            "js/STLLoader.js",
            "js/TrackballControls.js",
            "out/main.js",
        ].
        map(relativePath => `<script src="${buildUri(relativePath)}" nonce="${nonce}" defer></script>`).
        join("");


        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = `
            <!doctype html>
            <html>
                <head>
                <meta http-equiv="Content-Security-Policy" content="default-src ${cspSource} 'self' 'unsafe-eval' blob: data:; img-src ${cspSource} 'self' 'unsafe-eval' blob: data:; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'self' 'unsafe-eval' blob: data:;">
                ${scripts}
                </head>
                <body>
                </body>
            </html>
        `;
        console.log("Sending 'open' message to panel");
        webviewPanel.webview.postMessage({
            type: 'open',
            uri: webviewPanel.webview.asWebviewUri(document.uri).toString(),
        });
    }
}