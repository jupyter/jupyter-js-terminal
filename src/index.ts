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

import './index.css';


/**
 * The class name added to a terminal widget.
 */
const TERMINAL_CLASS = 'jp-TerminalWidget';

/**
 * The class name added to a terminal body.
 */
const TERMINAL_BODY_CLASS = 'jp-TerminalWidget-body';


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
   * Whether to blink the cursor.  Can only be set at startup.
   */
  cursorBlink?: boolean;

  /**
   * Whether to show a bell in the terminal.
   */
  visualBell?: boolean;

  /**
   * Whether to focus on a bell event.
   */
  popOnBell?: boolean;

  /**
   * Max number of scrollable lines in the terminal.
   */
  scrollback?: number;
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
   * @param options - The terminal configuration options.
   */
  constructor(options?: ITerminalOptions) {
    super();
    options = options || {};
    this.addClass(TERMINAL_CLASS);
    let baseUrl = handleBaseUrl(options.baseUrl);
    TerminalWidget.nterms += 1;
    let url = baseUrl + 'terminals/websocket/' + TerminalWidget.nterms;
    this._ws = new WebSocket(url);
    
    Terminal.brokenBold = true;

    this._term = new Terminal(getConfig(options));
    this._term.open(this.node);
    this._term.element.classList.add(TERMINAL_BODY_CLASS)

    if (options.background) this.background = options.background;
    if (options.color) this.color = options.color;

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

    this._sheet = document.createElement('style');
    this.node.appendChild(this._sheet);
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
   * Set the text color of the terminal.
   */
  set color(value: string) {
    this._term.colors[257] = value;
    this.update();
  }

  /**
   * Get whether the bell is shown.
   */
  get visualBell(): boolean {
    return this._term.visualBell;
  }

  /**
   * Set whether the bell is shown.
   */
  set visualBell(value: boolean) {
    this._term.visualBell = value;
  }

  /**
   * Get whether to focus on a bell event.
   */
  get popOnBell(): boolean {
    return this._term.popOnBell;
  }

  /**
   * Set whether to focus on a bell event.
   */
  set popOnBell(value: boolean) {
    this._term.popOnBell = value;
  }

  /**
   * Get the max number of scrollable lines in the terminal.
   */
  get scrollback(): number {
    return this._term.scrollback;
  }

  /**
   * Set the max number of scrollable lines in the terminal.
   */
  set scrollback(value: number) {
    this._term.scrollback = value;
  }

  /**
   * Dispose of the resources held by the terminal widget.
   */
  dispose(): void {
    this._term.destroy();
    this._sheet = null;
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
    // Set the fg and bg colors of the terminal and cursor.
    this._term.element.style.backgroundColor = this.background;
    this._term.element.style.color = this.color;
    this._sheet.innerHTML = (".terminal-cursor {background:" + this.color + 
                             ";color:" + this.background + ";}");
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
 * Get term.js options from ITerminalOptions.
 */
function getConfig(options: ITerminalOptions): ITerminalConfig {
  let config: ITerminalConfig = {};
  if (options.cursorBlink !== void 0) {
    config.cursorBlink = options.cursorBlink;
  }
  if (options.visualBell !== void 0) {
    config.visualBell = options.visualBell;
  }
  if (options.popOnBell !== void 0) {
    config.popOnBell = options.popOnBell;
  }
  if (options.scrollback !== void 0) {
    config.scrollback = options.scrollback;
  }
  return config;
}


/**
 * Handle logic for baseUrl.
 */
function handleBaseUrl(baseUrl?: string): string {
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
