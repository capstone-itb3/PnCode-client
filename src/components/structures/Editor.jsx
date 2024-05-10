import React, { useEffect, useState } from 'react'
import * as Y from 'yjs'

import { yCollab, yRemoteSelectionsTheme, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'

import * as random from 'lib0/random'


function Editor({ room_id, username, code, socketRef, socketId }) {

  const usercolors = [  
    { color: '#30bced', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' }
  ];
  const userColor = usercolors[random.uint32() % usercolors.length];

  const [ updates, setUpdates ] = useState();
  const [ view, setView ] = useState({ state: { doc: null } });
  const [ state, setState ] = useState(() => {
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', room_id, ydoc);
      const ytext = ydoc.getText('codemirror')
  
      provider.awareness.setLocalStateField('user', {
        name: username,
        color: userColor.color,
        colorLight: userColor.light
      })
      
      return EditorState.create({
        doc: ytext.toString(),
        extensions: [
          keymap.of([
            ...yUndoManagerKeymap
          ]),
          basicSetup,
          html(),
          yCollab(ytext, provider.awareness),
          oneDark,
          EditorView.updateListener.of((e) => {
            setUpdates(e.state.doc.toString());
          })
        ]
      });
  });

  let gotView = 0;
  useEffect(() => {
    if (!view.state.doc && gotView === 0) {
      setView(new EditorView({ state, parent: /** @type {HTMLElement} */ (document.querySelector('#editor-div')) }));
      gotView = 1;

    } else if (view.state.doc && gotView === 1){
      view.dispatch({
        changes: {from: 0, to: view.state.doc.length, insert: code}
      });    
      gotView = 2;
    }    

    try {
      const output = view.state.doc ? view.state.doc.toString() : 'Loading...';

      const iframe = document.getElementById('output-div');
      iframe.contentDocument.body.innerHTML = output;
      const scripts = iframe.contentDocument.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        iframe.contentWindow.eval(scripts[i].innerText);
      }

      console.log('Window render successful');
    } catch (e) {
      console.error(`Window render error: ${e}`);
    }
  }, [view.state]);

  useEffect(() => {
    if(socketRef.current && view.state.doc !== null) {
      socketRef.current.emit('update', {
        room_id,
        code: updates,
        socketId
      })

    //   socketRef.current.on('sync', ({ code }) => {
    //     if (code !== null && view.state.doc !== null) {
    //       view.state.doc = code; 

    //       let iframe = document.getElementById('output-div').contentWindow.document;
    //       iframe.open();
    //       iframe.write(view.state.doc.toString());
    //       iframe.close(); 
    //     }
    //       console.log('hello')
    //   });
    }

    return () => {
      socketRef.current.off('update');
    };

  }, [updates])

  
  return (
    <section id='editor-section'>
      <iframe title= 'Displays Output' id='output-div' /**onKeyUp={ escapeFullView }*/>
      </iframe>
      <div id='editor-div'>
      </div>
    </section>
  )
}

export default Editor;