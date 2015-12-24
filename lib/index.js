// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var phosphor_widget_1 = require('phosphor-widget');
var term_js_1 = require('term.js');
require('./index.css');
/**
 * The class name added to a terminal widget.
 */
var TERMINAL_CLASS = 'jp-TerminalWidget';
/**
 * The class name added to a terminal body.
 */
var TERMINAL_BODY_CLASS = 'jp-TerminalWidget-body';
/**
 * A widget which manages a terminal session.
 */
var TerminalWidget = (function (_super) {
    __extends(TerminalWidget, _super);
    /**
     * Construct a new terminal widget.
     *
     * @param baseUrl - The base websocket url for the session
     *   (e.g. 'ws://localhost:8888/').
     *
     * @param config - The terminal configuration options.
     */
    function TerminalWidget(options) {
        var _this = this;
        _super.call(this);
        this._sheet = null;
        options = options || {};
        this.addClass(TERMINAL_CLASS);
        var baseUrl = defaultBaseUrl(options.baseUrl);
        TerminalWidget.nterms += 1;
        var url = baseUrl + 'terminals/websocket/' + TerminalWidget.nterms;
        this._ws = new WebSocket(url);
        term_js_1.Terminal.brokenBold = true;
        this._term = new term_js_1.Terminal(getConfig(options));
        this._term.open(this.node);
        this._term.element.classList.add(TERMINAL_BODY_CLASS);
        if (options.background)
            this.background = options.background;
        if (options.color)
            this.color = options.color;
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
        this._sheet = document.createElement('style');
        this.node.appendChild(this._sheet);
    }
    Object.defineProperty(TerminalWidget.prototype, "background", {
        /**
         * Get the background color of the widget.
         */
        get: function () {
            return this._term.colors[256];
        },
        /**
         * Set the background color of the widget.
         */
        set: function (value) {
            this._term.colors[256] = value;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TerminalWidget.prototype, "color", {
        /**
         * Get the text color of the widget.
         */
        get: function () {
            return this._term.colors[257];
        },
        /**
         * Set the text color of the terminal.
         */
        set: function (value) {
            this._term.colors[257] = value;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TerminalWidget.prototype, "visualBell", {
        /**
         * Get whether the bell is shown.
         */
        get: function () {
            return this._term.visualBell;
        },
        /**
         * Set whether the bell is shown.
         */
        set: function (value) {
            this._term.visualBell = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TerminalWidget.prototype, "popOnBell", {
        /**
         * Get whether to focus on a bell event.
         */
        get: function () {
            return this._term.popOnBell;
        },
        /**
         * Set whether to focus on a bell event.
         */
        set: function (value) {
            this._term.popOnBell = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TerminalWidget.prototype, "scrollback", {
        /**
         * Get the max number of scrollable lines in the terminal.
         */
        get: function () {
            return this._term.scrollback;
        },
        /**
         * Set the max number of scrollable lines in the terminal.
         */
        set: function (value) {
            this._term.scrollback = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the resources held by the terminal widget.
     */
    TerminalWidget.prototype.dispose = function () {
        this._term.destroy();
        this._sheet = null;
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
     * A message handler invoked on an `'update-request'` message.
     */
    TerminalWidget.prototype.onUpdateRequest = function (msg) {
        // Set the fg and bg colors of the terminal and cursor.
        this._term.element.style.backgroundColor = this.background;
        this._term.element.style.color = this.color;
        this._sheet.innerHTML = (".terminal-cursor {background:" + this.color +
            ";color:" + this.background + ";}");
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
    /**
     * The number of terminals started.  Used to ensure unique sessions.
     */
    TerminalWidget.nterms = 0;
    return TerminalWidget;
})(phosphor_widget_1.Widget);
exports.TerminalWidget = TerminalWidget;
/**
 * Get term.js options from ITerminalOptions.
 */
function getConfig(options) {
    var config = {};
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
 * Handle default logic for baseUrl.
 */
function defaultBaseUrl(baseUrl) {
    if (baseUrl !== undefined) {
        if (baseUrl[baseUrl.length - 1] !== '/') {
            baseUrl += '/';
        }
        return baseUrl;
    }
    if (typeof location === undefined) {
        return 'ws://localhost:8888/';
    }
    else {
        return 'ws' + location.origin.slice(4) + '/';
    }
}
