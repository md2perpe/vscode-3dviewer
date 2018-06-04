'use strict';

import { ExtensionContext } from 'vscode';
import MeshPreviewContentProvider from './contentProvider';

export function activate(context: ExtensionContext) {
    context.subscriptions.push(new MeshPreviewContentProvider(context));
}
