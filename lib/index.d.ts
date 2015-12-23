import { Message } from 'phosphor-messaging';
import { ResizeMessage, Widget } from 'phosphor-widget';
import { ITerminalConfig } from 'term.js';
/**
 * Options for the terminal widget.
 */
export interface ITerminalOptions {
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
export declare class TerminalWidget extends Widget {
    /**
     * The number of terminals started.  Used to ensure unique sessions.
     */
    static nterms: number;
    /**
     * Construct a new terminal widget.
     *
     * @param baseUrl - The base websocket url for the session
     *   (e.g. 'ws://localhost:8888/').
     *
     * @param config - The terminal configuration options.
     */
    constructor(options?: ITerminalOptions);
    /**
     * Get the background color of the widget.
     */
    /**
     * Set the background color of the widget.
     */
    background: string;
    /**
     * Get the text color of the widget.
     */
    /**
     * Set the text color of the widget.
     */
    color: string;
    /**
     * Dispose of the resources held by the terminal widget.
     */
    dispose(): void;
    /**
     * Set up the initial size of the terminal when attached.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * On resize, use the computed row and column sizes to resize the terminal.
     */
    protected onResize(msg: ResizeMessage): void;
    /**
     * A message handler invoked on an `'update-request'` message.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Use a dummy terminal to measure the row and column sizes.
     */
    private _snapTermSizing();
    private _term;
    private _ws;
    private _row_height;
    private _col_width;
    private _sheet;
}
