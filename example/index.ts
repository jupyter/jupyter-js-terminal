/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, Jupyter Development Team.
|
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  Widget
} from 'phosphor-widget';

import {
  TerminalWidget
} from '../lib/index';


function main(): void {

  var term = new TerminalWidget('ws://localhost:8888/terminals/websocket/1');

  Widget.attach(term, document.body);

  window.onresize = () => term.update();
}


window.onload = main;
