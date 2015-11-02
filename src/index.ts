// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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

  /**
   * Construct a new terminal widget.
   */
  constructor(wsUrl: string, config?: ITerminalConfig) {
    super();
    this.addClass('TerminalWidget');
    this._ws = new WebSocket(wsUrl);
    this._config = config || { };
    this._config.screenKeys = config.screenKeys || false;
    this._config.useStyle = config.useStyle || false;

    Terminal.brokenBold = true;

    this._term = new Terminal(this._config);
    this._term.open(this.node);

    this._term.on('data', (data: string) => {
      this._ws.send(JSON.stringify(['stdin', data]));
    });

    this._term.on('title', (title: string) => {
        this.title.text = title;
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

  /**
   * Dispose of the resources held by the terminal widget.
   */
  dispose(): void {
    this._term.destroy();
    this._ws = null;
    this._term = null;
    super.dispose();
  }

  /**
   * Set up the initial size of the terminal when attached.
   */
  protected onAfterAttach(msg: Message): void {
    this._snapTermSizing();
  }

  /**
   * On resize, use the computed row and column sizes to resize the terminal.
   */
  protected onResize(msg: ResizeMessage): void {
    if (!this._row_height) this._row_height = 1;
    if (!this._col_width) this._col_width = 1;
    var rows = Math.max(2, Math.round(msg.height / this._row_height) - 1);
    var cols = Math.max(3, Math.round(msg.width / this._col_width) - 1);
    this._term.resize(cols, rows);
  }

  /**
   * Use a dummy terminal to measure the row and column sizes.
   */
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
