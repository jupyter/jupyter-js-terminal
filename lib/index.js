// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use-strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var phosphor_widget_1 = require('phosphor-widget');
var term_js_1 = require('term.js');
require('./index.css');
/**
 * A widget which manages a terminal session.
 */
var TerminalWidget = (function (_super) {
    __extends(TerminalWidget, _super);
    /**
     * Construct a new terminal widget.
     */
    function TerminalWidget(url, config) {
        var _this = this;
        _super.call(this);
        this.addClass('jp-TerminalWidget');
        this._ws = new WebSocket(url);
        this._config = config || {};
        this._config.screenKeys = this._config.screenKeys || false;
        this._config.useStyle = this._config.useStyle || false;
        term_js_1.Terminal.brokenBold = true;
        this._term = new term_js_1.Terminal(this._config);
        this._term.open(this.node);
        this._term.on('data', function (data) {
            _this._ws.send(JSON.stringify(['stdin', data]));
        });
        this._term.on('title', function (title) {
            _this.title.text = title;
        });
        this._ws.onmessage = function (event) {
            var json_msg = JSON.parse(event.data);
            switch (json_msg[0]) {
                case 'stdout':
                    _this._term.write(json_msg[1]);
                    break;
                case 'disconnect':
                    _this._term.write('\r\n\r\n[Finished... Term Session]\r\n');
                    break;
            }
        };
    }
    /**
     * Dispose of the resources held by the terminal widget.
     */
    TerminalWidget.prototype.dispose = function () {
        this._term.destroy();
        this._ws = null;
        this._term = null;
        _super.prototype.dispose.call(this);
    };
    /**
     * Set up the initial size of the terminal when attached.
     */
    TerminalWidget.prototype.onAfterAttach = function (msg) {
        this._snapTermSizing();
    };
    /**
     * On resize, use the computed row and column sizes to resize the terminal.
     */
    TerminalWidget.prototype.onResize = function (msg) {
        if (!this._row_height)
            this._row_height = 1;
        if (!this._col_width)
            this._col_width = 1;
        var rows = Math.max(2, Math.round(msg.height / this._row_height) - 1);
        var cols = Math.max(3, Math.round(msg.width / this._col_width) - 1);
        this._term.resize(cols, rows);
    };
    /**
     * Use a dummy terminal to measure the row and column sizes.
     */
    TerminalWidget.prototype._snapTermSizing = function () {
        var dummy_term = document.createElement('div');
        dummy_term.style.visibility = 'hidden';
        dummy_term.innerHTML = ('01234567890123456789' +
            '01234567890123456789' +
            '01234567890123456789' +
            '01234567890123456789');
        this._term.element.appendChild(dummy_term);
        this._row_height = dummy_term.offsetHeight;
        this._col_width = dummy_term.offsetWidth / 80;
        this._term.element.removeChild(dummy_term);
    };
    TerminalWidget.nterms = 0;
    return TerminalWidget;
})(phosphor_widget_1.Widget);
exports.TerminalWidget = TerminalWidget;
