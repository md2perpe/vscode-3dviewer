import * as vscode from 'vscode';
import ViewerProvider from './ViewerProvider';

export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('new-3dviewer.view', () => {
    // });

    // context.subscriptions.push(disposable);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('md2perpe.3dviewer', new ViewerProvider(context)),
    );
}

// this method is called when your extension is deactivated
export function deactivate() { }
