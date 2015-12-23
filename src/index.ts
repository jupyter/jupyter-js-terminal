// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

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
 * The class name added to a terminal widget.
 */
const TERMINAL_CLASS = 'jp-TerminalWidget';


/**
 * Options for the terminal widget.
 */
export 
interface ITerminalOptions {
  /**
   * The base websocket url.
   */
  baseUrl?: string;

  /**
   * The background color of the terminal.
   */
  background?: string;

  /**
   * The text color of the terminal.
   */
  color?: string;

  /**
   * The term.js configuration options.
   */
  config?: ITerminalConfig;
}


/**
 * A widget which manages a terminal session.
 */
export
class TerminalWidget extends Widget {

  /**
   * The number of terminals started.  Used to ensure unique sessions.
   */
  static nterms = 0;

  /**
   * Construct a new terminal widget.
   *
   * @param baseUrl - The base websocket url for the session
   *   (e.g. 'ws://localhost:8888/').
   *
   * @param config - The terminal configuration options.
   */
  constructor(options?: ITerminalOptions) {
    super();
    options = options || {};
    this.addClass(TERMINAL_CLASS);
    let baseUrl = defaultBaseUrl(options.baseUrl);
    TerminalWidget.nterms += 1;
    let url = baseUrl + 'terminals/websocket/' + TerminalWidget.nterms;
    this._ws = new WebSocket(url);
    
    Terminal.brokenBold = true;

    this._term = new Terminal(options.config);

    if (options.background) this.background = options.background;
    if (options.color) this.color = options.color;
    this.update();

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
   * Get the background color of the widget.
   */
  get background(): string {
    return this._term.colors[256];
  }

  /**
   * Set the background color of the widget.
   */
  set background(value: string) {
    this._term.colors[256] = value;
    this.update();
  }

  /**
   * Get the text color of the widget.
   */
  get color(): string {
    return this._term.colors[257];
  }

  /**
   * Set the text color of the widget.
   */
  set color(value: string) {
    this._term.colors[257] = value;
    this.update();
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
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.node.firstChild) this.node.removeChild(this.node.firstChild);
    this._term.open(this.node);
    if (this._sheet) {
      document.body.removeChild(this._sheet);
    }
    this._sheet = document.createElement('style');
    document.body.appendChild(this._sheet);
    this._sheet.innerHTML = (".terminal-cursor {background: " + this.color + 
                             "; color:" + this.background + ";}");
    setTimeout(() => {
      this._term.refreshBlink();
    }, 100);
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
  private _sheet: HTMLElement = null;
}



/**
 * Handle default logic for baseUrl.
 */
function defaultBaseUrl(baseUrl?: string): string {
  if (baseUrl !== undefined) {
    if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }
    return baseUrl;
  }
  if (typeof location === undefined) {
    return 'ws://localhost:8888/';
  } else {
    return 'ws' + location.origin.slice(4) + '/';
  }
}
