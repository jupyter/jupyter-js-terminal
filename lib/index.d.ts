import { Message } from 'phosphor-messaging';
import { ResizeMessage, Widget } from 'phosphor-widget';
import { ITerminalConfig } from 'term.js';
/**
 * A widget which manages a terminal session.
 */
export declare class TerminalWidget extends Widget {
    static nterms: number;
    /**
     * Construct a new terminal widget.
     */
    constructor(config?: ITerminalConfig);
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
     * Use a dummy terminal to measure the row and column sizes.
     */
    private _snapTermSizing();
    private _term;
    private _ws;
    private _row_height;
    private _col_width;
    private _config;
}
