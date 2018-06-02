'use strict';

import { Disposable, TextDocumentContentProvider, Uri, EventEmitter, Event, workspace, ExtensionContext, commands, ViewColumn, window } from 'vscode';

import * as path from 'path';

export default class MeshPreviewContentProvider implements TextDocumentContentProvider {
    
    private static s_instance: MeshPreviewContentProvider = null;
    private _disposable: Disposable;
    private _onDidChange = new EventEmitter<Uri>();

    constructor(
        private context: ExtensionContext
    ) {
        MeshPreviewContentProvider.instance = this;

        this._disposable = Disposable.from(

            this._onDidChange,

            workspace.registerTextDocumentContentProvider('preview3dfile',  this),
            workspace.registerTextDocumentContentProvider('preview3dhttp',  this),
            workspace.registerTextDocumentContentProvider('preview3dhttps', this),

            commands.registerCommand("3dviewer.openInViewer", (fileUri: Uri) => {
                if (fileUri) {
                    let previewUri = fileUri.with({scheme: 'preview3dfile'});
                    commands.executeCommand('vscode.previewHtml', previewUri, ViewColumn.Active, "3D Mesh Preview");
                    console.log(previewUri.toString());
                }
            }),

            commands.registerCommand("3dviewer.openUrlInViewer", () => {
                window.showInputBox({prompt: "Enter URL to open", placeHolder: "http://..."}).then((value) => {
                    if (value) {
                        let fileUri = Uri.parse(value);
                        let previewUri = fileUri.with({scheme: 'preview3d' + fileUri.scheme});
                        commands.executeCommand('vscode.previewHtml', previewUri, ViewColumn.Active, "3D Mesh Preview");
                        console.log(previewUri.toString());
                    }
                })
            }),
            
        );
    }

    public dispose(): void {
        MeshPreviewContentProvider.instance = null;
        this._disposable.dispose();
    }

    private static set instance(instance: MeshPreviewContentProvider) {
        if (MeshPreviewContentProvider.s_instance) {
            MeshPreviewContentProvider.s_instance.dispose();
        }
        MeshPreviewContentProvider.s_instance = instance;
    }

    private static get instance() {
        return MeshPreviewContentProvider.s_instance;
    }

    private getMediaPath(mediaFile: string): string {
		return Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
    }

    private getSettings(uri: Uri): string {
        let config = workspace.getConfiguration('3dviewer');
        let initialData = {
            fileToLoad: uri.toString(),
            wireframe: config.get('wireframe', false),
            background: config.get('background', '#8f8f8f'),
            boundingBox: config.get('boundingBox', false),
            grid: config.get('grid', true),
            gridSize: config.get('gridSize', 32),
            near: config.get('near', 0.01),
            far: config.get('far', 1000000)
        }
        return `<meta id="vscode-3dviewer-data" data-settings="${JSON.stringify(initialData).replace(/"/g, '&quot;')}">`
    }

    private getScripts(): string {
        const scripts = [
            'build/three.js', 
            'examples/js/libs/inflate.min.js',
            'examples/js/libs/dat.gui.min.js',
            'examples/js/controls/OrbitControls.js',
            'examples/js/loaders/ColladaLoader.js',
            'examples/js/loaders/FBXLoader.js',
            'examples/js/loaders/TDSLoader.js',
            'examples/js/loaders/OBJLoader.js',
            'examples/js/loaders/STLLoader.js',
            'viewer.js'
        ];
        return scripts
            .map(source => `<script src="${this.getMediaPath(source)}"></script>`)
            .join('\n');
    }

    public provideTextDocumentContent(uri: Uri): Thenable<string> {
        switch(uri.scheme) {
            case 'preview3dfile':
                uri = uri.with({scheme: 'file'});
                break;
            case 'preview3dhttp':
                uri = uri.with({scheme: 'http'});
                break;
            case 'preview3dhttps':
                uri = uri.with({scheme: 'https'});
                break;
            default:
                return null;
        }
        return new Promise( async (resolve) => {
            resolve(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <title>three.js webgl - FBX loader</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
                    ${this.getSettings(uri)}
                    <base href="${this.getMediaPath('/')}">
                    <style>
                        body {
                            font-family: Monospace;
                            background-color: #0f0;
                            color: #f00;
                            margin: 0px;
                            padding: 0px 0px;
                            overflow: hidden;
                        }
                    </style>
                </head>
                <body>
                    ${this.getScripts()}
                </body>
            </html>
            `
            );
        });
    }

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }
    
    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }
}
