import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { BsCheck2, BsXLg, BsExclamationTriangleFill } from 'react-icons/bs';
import * as Y from 'yjs'
import { yCollab, yRemoteSelectionsTheme, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment, StateEffect } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript, esLint } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from './utils/JSesLint'
import _ from 'lodash'

function Editor({ user, cursorColor, file, socket, setSaved, editorUsers, setEditorUsers, editorTheme, setWarning}) {
  const { room_id } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const compartmentRef = useRef(new Compartment());
  let storeInHistory = false;

  const editorListener = (event) => {
    const isModifierKey = event.altKey || event.ctrlKey || event.metaKey;
    const isNavigationKey = event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown';
    const isFunctionKey = event.key.startsWith('F') && event.key.length > 1;
    const isEditingKey = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'Enter';
    
    if (!isModifierKey && !isNavigationKey && !isFunctionKey && (event.key.length === 1 || isEditingKey)) {
      if (user?.position === 'Student') {
        debounceUserType(user.uid);
      }
    }
  };

  const debounceUserType = _.debounce((editing_user_id) => {
      socket.emit('add_edit_count', {
        file_id: file.file_id,
        user_id: editing_user_id,
      });
      console.log('debounced');
  }, 500);

  useEffect(() => {
    editorRef.current ? editorRef.current.destroy() : null;
    providerRef.current ? providerRef.current.destroy() : null;
    
    if (file === null) {
      return;
    }

    async function init() {
      return new Promise((resolve) => {
        socket.emit('join_editor', {
          file_id: file.file_id,
          user_id: user.uid,
        });
    
        socket.on('editor_users_updated', ({ users }) => {
          setEditorUsers(users);
          resolve(users);
        });
      });
    }
    init().then((users) => {
      const ydoc = new Y.Doc();
      
      providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
        `${file.file_id}`, 
        ydoc
      );
      
      providerRef.current.awareness.setLocalStateField('user', {
        userId: user.uid,
        name: user.last_name + ', ' + user.first_name,
        color: cursorColor.color,
      });
    
      const type = () => {
        if      (file.name.endsWith('.html')) return html(); 
        else if (file.name.endsWith('.css'))  return css();
        else if (file.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
      }
      const theme = editorTheme === 'dark' ? oneDark : clouds;
      const setup = () => {
        if (user?.position === 'Student') {
          return [basicSetup]
        }else if (user?.position === 'Professor') {
          return [basicSetup, EditorState.readOnly.of(true)];
        }
      }

      providerRef.current.on('synced', () => {
        const ytext = ydoc.getText('codemirror');
        let initialContent = ytext.toString();
        if (((initialContent === '' || initialContent === null) && users.length === 1)) {
          ydoc.transact(() => {
            ytext.insert(0, file.content);
          });
          initialContent = file.content;
        }
        


        const state = EditorState.create({
          doc: initialContent,
          extensions: [
            keymap.of([...yUndoManagerKeymap, indentWithTab]),
            setup(),
            type(),
            compartmentRef.current.of([theme]),
            yCollab(ytext, providerRef.current.awareness),
            lintGutter(),
            EditorView.updateListener.of(e => {
              if (e.docChanged) {
                updateCode(e);
              }
            }),
            EditorView.theme({
              '.cm-ySelectionInfo': {
                top: '-6px !important',
                display: 'inline-block !important',
                opacity: '1 !important',
                padding: '2px !important',
                transition: 'none !important'
              }
            }),
          ]
        });
        
        const editor_div = document.getElementById('editor-div');
        editor_div.innerHTML = '';
        
        editorRef.current = new EditorView({ state, parent: (editor_div) });
        editor_div.addEventListener('keydown', editorListener);
      });
    });
    

    socket.on('update_result', ({ status }) => {
      if (status === 'ok') {
        setSaved( <label className='items-center' id='saved'>
                      <BsCheck2 size={14}/><span>Saved</span>
                  </label>
                );
      } else {
        setSaved( <label className='items-center' id='unsaved'>
                    <BsExclamationTriangleFill size={13}/><span>Unsaved</span>
                  </label>
                );
      }
    });
  
    return () => {
      document.getElementById('editor-div')?.removeEventListener('keydown', editorListener);
      socket.off('editor_users_updated');
      socket.off('update_result');
      socket.off('add_edit_count_result');

      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    }
  }, [file]);

  useEffect(() => {
    if (editorRef.current) {
      const theme = editorTheme === 'dark' ? oneDark : clouds;
      editorRef.current.dispatch({
        effects: compartmentRef.current.reconfigure([theme])
      });
    }
  }, [editorTheme]);
      
  useEffect(() => {
    const interval = setInterval(() => {
      storeInHistory = true;
    }, 360000);

    return () => {
      clearInterval(interval);
    }
  }, [file])

  const updateCode = (e) => {

    let line_number = 1;
    if (e.state && e.state.selection) {
      line_number = e.state.doc.lineAt(e.state.selection.main.head).number;
    }

    let isEmpty = e.state.doc.toString() === '' && e.state.doc === null;
    let allSpaces = new RegExp('^\\s*$').test(e.state.doc.toString());

    if (e.state.doc && !isEmpty && !allSpaces) {
      setSaved( <label id='saving'>Saving...</label>);

      socket.emit('update_code', {
        file_id: file.file_id,
        user_id: user.uid,
        code: e.state.doc.toString(),
        line: line_number,
        store_history: storeInHistory,
      });
      storeInHistory = false;

      setWarning(0);
    } else if ( isEmpty || allSpaces) {
      setWarning(1);
    }
  }

  return (
    <>
      <div id='editor-div'>
      </div>
    </>
  )
}

export default React.memo(Editor);