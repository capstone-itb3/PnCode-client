import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

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


function Editor({ room, user, file, socket }) {
  const { room_id } = useParams();
  const [socketId, setSocketId] = useState(user.uid);
  const [savedCodeInserted, setSavedCodeInserted] = useState(false);
  const [ code, setCode ] = useState('');
  const [ updates, setUpdates ] = useState();
  const [ view, setView ] = useState({ state: { doc: null } });

  const usercolors = [  
    { color: 'red', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' }
  ];
  const userColor = usercolors[random.uint32() % usercolors.length];

  const [ state, setState ] = useState(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
      `${room_id}-${file}`, 
      ydoc
    );
    const ytext = ydoc.getText('codemirror')
    
    provider.awareness.setLocalStateField('user', {
      userId: user.uid,
      name: user.last_name + ', ' + user.first_name[0] + '.',
      color: userColor.color,
      colorLight: userColor.light
    })

    // addToActiveMembers(provider.awareness.getLocalStateField('user'));

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

  useEffect(() => {
    if (!view.state.doc && !savedCodeInserted) {
      setView(new EditorView({ 
                      state, 
                      parent: /** @type {HTMLElement} */ 
                              (document.querySelector(`#editor-div`))
      }));

    } else if (view.state.doc && !savedCodeInserted) {
      view.dispatch({
        changes: {from: 0, to: view.state.doc.length, insert: code}
      });    
      setSavedCodeInserted(true);
    }
  }, [view.state.doc]);

  //   return () => {
  //     socket.off('update');
  //   };

  // }, [updates]);

  return (
      <div id={`editor-div`} className='editor-div'>
      </div>
  )
}

export default Editor;