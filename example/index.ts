/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, Jupyter Development Team.
|
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
'use strict';

import {
  TerminalWidget
} from '../lib/index';


function main(): void {
  let term = new TerminalWidget({ background: 'black',
                                  color: 'white'});

  term.attach(document.body);

  term.fit();
  window.onresize = () => term.fit();

  setTimeout(() => {
      term.background = 'white';
      term.color = 'black';
      term.fontSize = 20;
  }, 2000);
}


window.onload = main;
