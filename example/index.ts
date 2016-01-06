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

  window.onresize = () => term.update();

  setTimeout(() => {
      term.background = 'white';
      term.color = 'black';
  }, 2000);
}


window.onload = main;
