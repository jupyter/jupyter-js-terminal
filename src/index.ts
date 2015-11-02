/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  Message
} from 'phosphor-messaging';

import {
  ResizeMessage, Widget
} from 'phosphor-widget';

import {
  Terminal, ITerminalConfig
} from 'term.js';


/**
 * A widget which manages a terminal session.
 */
class TerminalWidget extends Widget {

  static nterms = 0;

  static createTerminal(wsUrl: string, config?: ITerminalConfig) : TerminalWidget {
    TerminalWidget.nterms += 1;
    var term = new TerminalWidget(wsUrl, config);
    return term;
  }

  constructor(ws_url: string, config?: ITerminalConfig) {
    super();
    this.addClass('TerminalWidget');
    this._ws = new WebSocket(ws_url);
    this._config = config || { useStyle: true };

    this._term = new Terminal(this._config);
    this._term.open(this.node);

    this._term.on('data', (data: string) => {
      this._ws.send(JSON.stringify(['stdin', data]));
    });

    this._ws.onmessage = (event: MessageEvent) => {
      var json_msg = JSON.parse(event.data);
      switch (json_msg[0]) {
      case 'stdout':
        this._term.write(json_msg[1]);
        break;
      case 'disconnect':
        this._term.write('\r\n\r\n[Finished... Term Session]\r\n');
        break;
      }
    };
  }

  dispose(): void {
    this._term.destroy();
    this._ws = null;
    this._term = null;
    super.dispose();
  }

  protected onAfterAttach(msg: Message): void {
    this._snapTermSizing();
  }

  protected onResize(msg: ResizeMessage): void {
    if (!this._row_height) this._row_height = 1;
    if (!this._col_width) this._col_width = 1;
    var rows = Math.max(2, Math.round(msg.height / this._row_height) - 1);
    var cols = Math.max(3, Math.round(msg.width / this._col_width) - 1);
    this._term.resize(cols, rows);
  }

  private _snapTermSizing(): void {
    var dummy_term = document.createElement('div');
    dummy_term.style.visibility = 'hidden';
    dummy_term.innerHTML = (
      '01234567890123456789' +
      '01234567890123456789' +
      '01234567890123456789' +
      '01234567890123456789'
    );

    this._term.element.appendChild(dummy_term);
    this._row_height = dummy_term.offsetHeight;
    this._col_width = dummy_term.offsetWidth / 80;
    this._term.element.removeChild(dummy_term);
  }

  private _term: any;
  private _ws: WebSocket;
  private _row_height: number;
  private _col_width: number;
  private _config: ITerminalConfig;
}
