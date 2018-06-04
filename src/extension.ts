'use strict';

import { Disposable, ExtensionContext} from 'vscode';
import MeshPreviewContentProvider from './contentProvider';

let _disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {

    context.subscriptions.push(new Disposable(() => Disposable.from(..._disposables).dispose()));
    
    _disposables.push( new MeshPreviewContentProvider(context) );

}
