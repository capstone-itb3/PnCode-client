import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { BsCheck2, BsExclamationTriangleFill } from 'react-icons/bs';
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript  } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from './utils/JSesLint'
import _ from 'lodash'

function Editor({ user, cursorColor, file, socket, open_time, close_time, setSaved, editorUsers, setEditorUsers, editorTheme, setWarning}) {
  const { room_id } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const openTimeRef = useRef(open_time);
  const closeTimeRef = useRef(close_time);
  const themeCompartmentRef = useRef(new Compartment());
  const readOnlyCompartmentRef = useRef(new Compartment());
  const inSameLineRef = useRef(false);

  let storeInHistory = false;

  const editorListener = (event) => {

    const isModifierKey = event.altKey || event.ctrlKey || event.metaKey;
    const isNavigationKey = event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown';
    const isFunctionKey = event.key.startsWith('F') && event.key.length > 1;
    const isEditingKey = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'Enter';
    
    if (!isModifierKey && !isNavigationKey && !isFunctionKey && (event.key.length === 1 || isEditingKey)) {
      if (user?.position === 'Student') {
        const timeframe = checkAccessDates(openTimeRef.current, closeTimeRef.current);
        // console.log(checkAccessDates(openTimeRef.current, closeTimeRef.current));
        // console.log(openTimeRef.current, closeTimeRef.current);
        // console.log(new Date().toTimeString());

        if (!inSameLineRef.current) {
          editorRef.current?.dispatch({
            effects: readOnlyCompartmentRef.current.reconfigure([
              EditorState.readOnly.of(!timeframe)
            ])
          });
        } else {
          editorRef.current?.dispatch({
            effects: readOnlyCompartmentRef.current.reconfigure([
              EditorState.readOnly.of(true)
            ])
          });          
        }
        if (timeframe === false) {
          setWarning(2);
          return;

        } else {
          setWarning(0);
          debounceUserType(user.uid);
        }
      }
    } 
  if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      updateCode(editorRef.current);
    }
  };

  const debounceUserType = _.debounce((editing_user_id) => {
    if (editorRef.current) {
      socket.emit('add_edit_count', {
        file_id: file.file_id,
        user_id: editing_user_id,
      });

      // console.log(editorRef.current.state.doc.toString());
      updateCode(editorRef.current);
    }
  }, 200);

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
        light: cursorColor.light,
        line: 0,
        position: user.position,
      });
    
      const type = () => {
        if      (file.name.endsWith('.html')) return html(); 
        else if (file.name.endsWith('.css'))  return css();
        else if (file.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
      }
      const theme = editorTheme === 'dark' ? oneDark : clouds;
      
      const access = () => {
        if (user?.position === 'Student') {
          return EditorState.readOnly.of(!checkAccessDates(openTimeRef.current, closeTimeRef.current));
        } else if (user?.position === 'Professor') {
          return EditorState.readOnly.of(true);
        }          
      }

      if (checkAccessDates(openTimeRef.current, closeTimeRef.current) === false) {
        setWarning(2);
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
            type(),
            basicSetup,
            readOnlyCompartmentRef.current.of([access()]),
            themeCompartmentRef.current.of([theme]),
            yCollab(ytext, providerRef.current.awareness),
            lintGutter(),
            EditorView.theme({
              '.cm-ySelectionInfo': {
                top: '-6px !important',
                display: 'inline-block !important',
                opacity: '1 !important',
                padding: '2px !important',
                transition: 'none !important'
              },
              '.cm-line': {
                position: 'relative'
              }
            }),
          ]
        });
        
        const editor_div = document.getElementById('editor-div');
        editor_div.innerHTML = '';
        
        editorRef.current = new EditorView({ state, parent: (editor_div) });
        editor_div.addEventListener('keydown', editorListener);

        providerRef.current.awareness.on('change', ({ added, removed, updated }) => {  
          const local_line = editorRef.current?.state?.doc.lineAt(editorRef.current?.state?.selection?.main?.head)?.number;

          let allOtherUsers = Array.from(providerRef.current.awareness.getStates().values())
                                    .map(state => state.user)

          allOtherUsers = allOtherUsers.filter((u) => {
            const notUndefined = u !== undefined;
            const notMe = u?.userId !== user.uid;
            const notLineOne = Number(u?.line) > 1;
            const isStudent = u?.position === 'Student';

            return notUndefined && notMe && notLineOne && isStudent;
          });
          
          let hasSameLine = false;

          for (let i = 0; i < allOtherUsers.length; i++) {
            if (allOtherUsers[i].line.toString() === local_line.toString()) {
              hasSameLine = true;
              break;
            }
          }

          if (hasSameLine) {
            providerRef.current.awareness.setLocalStateField('user', {
              ...providerRef.current.awareness.getLocalState().user,
              line: 0,
            });  
            
            inSameLineRef.current = true;
            
          } else {
            providerRef.current.awareness.setLocalStateField('user', {
              ...providerRef.current.awareness.getLocalState().user,
              line: local_line,
            });  

            inSameLineRef.current = false;
          }
        });
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

    socket.on('dates_updated', ({ new_open_time, new_close_time }) => {
      openTimeRef.current = new_open_time;
      closeTimeRef.current = new_close_time;

      if (editorRef.current && user.position === 'Student') {
        editorRef.current.dispatch({
          effects: readOnlyCompartmentRef.current.reconfigure([
              EditorState.readOnly.of(!checkAccessDates(new_open_time, new_close_time))
            ])
        });
      }

      console.log('dates_updated', new_open_time, new_close_time);
      
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
        effects: themeCompartmentRef.current.reconfigure([theme])
      });
    }
  }, [editorTheme]);
      
  useEffect(() => {
    if (editorRef.current) {
      storeInHistory = true;
    }
    
    const interval = setInterval(() => {
      storeInHistory = true;
    }, 30000);

    return () => {
      clearInterval(interval);
    }
  }, [file, editorRef.current]);

  function updateCode (e) {
    let line_number = 1;
    if (e.state && e.state.selection) {
      line_number = e.state.doc.lineAt(e.state.selection.main.head).number;
      console.log(line_number);
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

  function checkAccessDates(open_time, close_time) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
  
    const [openHours, openMinutes] = open_time.split(':').map(Number);
    const [closeHours, closeMinutes] = close_time.split(':').map(Number);
  
    const openTimeMinutes = openHours * 60 + openMinutes;
    const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
    return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
  }
  
  return (
    <>
      <div id='editor-div'>
      </div>
    </>
  )
}

export default React.memo(Editor);