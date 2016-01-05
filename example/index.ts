/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, Jupyter Development Team.
|
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
'use strict';

import {
  getConfigOption
} from 'jupyter-js-utils';

import {
  TerminalWidget
} from '../lib/index';


function main(): void {
  let baseUrl = getConfigOption('wsUrl');
  let term = new TerminalWidget({ baseUrl: baseUrl,
                                  background: 'black',
                                  color: 'white'});

  term.attach(document.body);

  window.onresize = () => term.update();

  setTimeout(() => {
      term.background = 'white';
      term.color = 'black';
  }, 2000);
}


window.onload = main;
