// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  getConfigOption
} from 'jupyter-js-utils';

import {
  IAppShell
} from 'phosphide';

import {
  Container
} from 'phosphor-di';

import {
  TerminalWidget
} from './index';


export
function resolve(container: Container): Promise<void> {
  return container.resolve(TerminalHandler).then(handler => { handler.run(); });
}


class TerminalHandler {

  static requires = [IAppShell];

  static create(shell: IAppShell): TerminalHandler {
    return new TerminalHandler(shell);
  }

  constructor(shell: IAppShell) {
    this._shell = shell;
  }

  run(): void {
    let baseUrl = getConfigOption('wsUrl');
    let term = new TerminalWidget({ baseUrl: baseUrl,
                                  background: 'black',
                                  color: 'white'});
    term.title.closable = true;
    this._shell.addToMainArea(term);
  }

  private _shell: IAppShell;
}
