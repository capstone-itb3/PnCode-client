import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { BsCheck2, BsXLg, BsExclamationTriangleFill } from 'react-icons/bs';
import * as Y from 'yjs'
import { yCollab, yRemoteSelectionsTheme, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript, esLint } from '@codemirror/lang-javascript'
import * as eslint from 'eslint-linter-browserify'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import jsLint from './utils/JSesLint';

function Editor({ room, user, cursorColor, file, socket, setSaved, editorUsers, setEditorUsers, setWarning}) {
  const { room_id } = useParams();
  const [ view, setView ] = useState(null);
  const providerRef = useRef(null);
  
  useEffect(() => {
    view ? view.destroy() : null;
    providerRef.current ? providerRef.current.destroy() : null;

    setView(null);
    providerRef.current = null;

    async function init() {
      return new Promise((resolve) => {
        socket.emit('join_editor', {
          room_id: room_id,
          file_name: file.name,
          user_id: user.uid,
        });
    
        socket.on('editor_users_updated', (users) => {
          setEditorUsers(users);
          // console.log('editor users:', users);
          resolve(users);
        });
      });
    }
    init().then((users) => {
      const ydoc = new Y.Doc();
      
      providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
        `${room_id}-${file.name}`, 
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
            basicSetup,
            type(),
            yCollab(ytext, providerRef.current.awareness),
            oneDark, 
            lintGutter(),
            EditorView.updateListener.of(e => {
              if (e.docChanged) {
                updateCode(e);
              }
            }),
            EditorView.theme({
              '.cm-ySelectionInfo': {
                display: 'inline-block !important',
                opacity: '1 !important',
                padding: '2px !important',
                transition: 'none !important'
              }
            }),
          ]
        });
        setView(new EditorView({ state, parent: (document.querySelector(`#editor-div`)) }));
      });
    });
                
    return () => {
      providerRef.current.destroy();
      socket.off('editor_users_updated');
    }
  }, [file]);

  // useEffect(() => {
  //   if (view) {
  //     console.log(view);
  //   }
  // }, [view])

  const updateCode = (e) => {
    let lineNumber = 1;
    let isEmpty = e.state.doc.toString() === '' && e.state.doc === null;
    let allSpaces = new RegExp('^\\s*$').test(e.state.doc.toString());

    if (e.state.doc && !isEmpty && !allSpaces) {
      setSaved( <label id='saving'>
                  Saving...
                </label>
              );

      socket.emit('update_code', {
        room_id: room_id,
        file_name: file.name,
        code: e.state.doc.toString()
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
      })
      setWarning(0);
    } else if ( isEmpty || allSpaces) {
      setWarning(1);
      console.log('empty');
    }

    if (e.state && e.state.selection) {
      lineNumber = e.state.doc.lineAt(e.state.selection.main.head).number;

      socket.emit('send_line_number', {
        room_id: room_id,
        file_name: file.name,
        user_id: user.uid,
        line: lineNumber,  
      });
    }

    socket.on('toggle_line_access', (users) => {
      // console.log(users);
    });  

    return () => {
      socket.off('update_result');
      socket.off('toggle_line_access');
    }
  }

  // useEffect(() => {
  //   if (savedCodeInserted) {

  //     socket.emit('update_code', {
  //       room_id: room_id,
  //       file_name: file.name,
  //       code: updates
  //     });

  //     socket.emit('find_line_number', {
  //       line: view.state.doc.lineAt(state.selection.main.head).number,  
  //       uid: user.uid,
  //       room_id: room_id
  //       // file: file
  //     });
  
  //     //get where the use cursor is
  //     // console.log(view.state.doc.lineAt(view.state.selection.main.head).number);
  //   }
  // }, [updates])

  return (
      <div id='editor-div' className='editor-div'>
      </div>
  )
}

export default Editor;