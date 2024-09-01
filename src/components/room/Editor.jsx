import React, { useEffect, useState, useRef } from 'react'
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


function Editor({ room, user, file, socket}) {
  const { room_id } = useParams();
  const [editorUsers, setEditorUsers] = useState([]);

  const [socketId, setSocketId] = useState(user.uid);
  const [savedCodeInserted, setSavedCodeInserted] = useState(false);
  const [ updates,  setUpdates ] = useState();
  const [ view, setView ] = useState({ state: { doc: null } });
  const [ state, setState ] = useState(null); 
  const providerRef = useRef(null);

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
  
  useEffect(() => {
    const ydoc = new Y.Doc();

    if (view.state.doc) {
      view.destroy();
    }

    setView({ state: { doc: null } });
    setState(null);
    setUpdates(null);
    setSavedCodeInserted(false);

    if (providerRef.current) {
      providerRef.current.destroy();
    }


    providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
      `${room_id}-${file.name}`, 
      ydoc
    );
    const ytext = ydoc.getText('codemirror')
    
    providerRef.current.awareness.setLocalStateField('user', {
      userId: user.uid,
      name: user.last_name + ', ' + user.first_name[0] + '.',
      color: userColor.color,
      colorLight: userColor.light
    })

    const new_state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        keymap.of([
          ...yUndoManagerKeymap
        ]),
        basicSetup,
        html(),
        yCollab(ytext, providerRef.current.awareness),
        oneDark,
        EditorView.updateListener.of((e) => {
          updateCode(e);
        })
      ]
    });

    socket.emit('join_editor', {
      room_id: room_id,
      file_name: file.name,
      user_id: user.uid       
    });

    socket.on('editor_users_updated', (users) => {
      setEditorUsers(users);
    })

    setState(new_state);

    return () => {
      socket.off('editor_users_updated');
      providerRef.current.destroy();
    }
  }, [file]);

  useEffect(() => {
    if (!view.state.doc && !savedCodeInserted && state) {
      setView(new EditorView({ 
                      state, 
                      parent: /** @type {HTMLElement} */ 
                              (document.querySelector(`#editor-div`))
      }));

    } else if (view.state.doc && !savedCodeInserted) {
      console.log('editor');
      console.log(editorUsers);

      // if (editorUsers.length <= 1) {
      //   view.dispatch({
      //     changes: {from: 0, to: view.state.doc.length, insert: file.content}
      //   });
      // }
      setSavedCodeInserted(true);
    }
  }, [view.state.doc, state]);

  function updateCode(current_view) {
    setUpdates(current_view.state.doc.toString());
  }

  useEffect(() => {
    if (savedCodeInserted) {
      socket.emit('update_code', {
        room_id: room_id,
        file: file.name,
        code: updates
      });

      socket.emit('find_line_number', {
        line: view.state.doc.lineAt(state.selection.main.head).number,  
        uid: user.uid,
        room_id: room_id
        // file: file
      });
  
      //get where the use cursor is
      console.log(view.state.doc.lineAt(view.state.selection.main.head).number);
    }
  }, [updates])

  return (
      <div id={`editor-div`} className='editor-div'>
      </div>
  )
}

export default Editor;