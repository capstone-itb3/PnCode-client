import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { BsCheck2, BsExclamationTriangleFill } from 'react-icons/bs';
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { completeFromList } from '@codemirror/autocomplete'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript } from '@codemirror/lang-javascript'
import { html, htmlLanguage } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from './utils/JSesLint'
import { html5Snippet } from './utils/codeSnippets'
import checkTimeframe from './utils/checkTimeframe'
import changeTheme from './utils/changeTheme';
import _ from 'lodash'
// import VirtualFileSystem from '../virtualFileSystem'

function Editor({ user, cursorColor, file, socket, open_time, close_time, setSaved, editorTheme, warning, setWarning}) {
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
    try {
      const isModifierKey = event.altKey || event.ctrlKey || event.metaKey;
      const isNavigationKey = event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown';
      const isFunctionKey = event.key.startsWith('F') && event.key.length > 1;

      const isEditingKey = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'Enter';
      const onTime = checkTimeframe(openTimeRef.current, closeTimeRef.current);    

      //Ctrl + S to save the code
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onTime ? updateCode(editorRef.current) : null;

        return;
      }    

      if (!isModifierKey && !isNavigationKey && !isFunctionKey (event.key.length === 1 || isEditingKey)) {
        if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Enter') {
          updateAwareness();
        }

        //check the readOnly config and will be used to minimize the number of times the editor
        //...is updated so it can only be updated when readOnly must be in opposite state
        const currentConfig = readOnlyCompartmentRef.current.get(editorRef.current.state)[0].value;

        //first checks if the cursor is not the same line as other user's cursor and
        //...the current time is within the open and close time
        if (!inSameLineRef.current && onTime) {
          //if yes, it then checks if the current config of readOnly is true 
          if (currentConfig === true){
            //if currently true, it then modifies the readOnly state of the editor to false
            editorRef.current?.dispatch({
              effects: readOnlyCompartmentRef.current.reconfigure([
                EditorState.readOnly.of(false)
              ])
            });
          }
          warning !== 0 ? setWarning(0) : null;
          debounceUserType(user.uid);

        } else if (inSameLineRef.current || !onTime) {
          //if in same line or not on time, it then checks if the current config of readOnly is false
          if (currentConfig === false) {
            //if currently false, it then modifies the readOnly state of the editor to true
            editorRef.current?.dispatch({
              effects: readOnlyCompartmentRef.current.reconfigure([
                EditorState.readOnly.of(true)
              ])
            });
          }
          onTime && inSameLineRef.current && warning !== 3 ? setWarning(3) : null;
          !onTime && warning !== 2 ? setWarning(2) : null;
        }
      } 
    } catch (e) {
      console.error(e);
    }
  };

  const debounceUserType = _.debounce((editing_user_id) => {
    if (editorRef.current) {
      socket.emit('add_edit_count', {
        file_id: file.file_id,
        user_id: editing_user_id,
      });

      updateCode(editorRef.current);
    }
  }, 200);

  const updateAwareness = () => {
    if (!providerRef.current || !editorRef.current) {
      return;
    }

    try {
      const local_line = editorRef.current?.state?.doc.lineAt(editorRef.current?.state?.selection?.main?.head)?.number;

      let allOtherUsers = Array.from(providerRef.current.awareness.getStates().values())
                                .map(state => state.user);
  
      allOtherUsers = allOtherUsers.filter((u) => {
        const notUndefined = u !== undefined;
        const notMe = u?.userId !== user.uid;
        const notLineOne = Number(u?.line) > 1;
        const isEditing = u?.position !== 'Professor';
  
        return notUndefined && notMe && notLineOne && isEditing;
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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    editorRef.current ? editorRef.current.destroy() : null;
    providerRef.current ? providerRef.current.destroy() : null;
    
    if (file === null) {
      return;
    }



    try {


      async function init() {
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
          if      (file.name.endsWith('.html')) return [html(), htmlLanguage.data.of({ autocomplete: [html5Snippet] }),]; 
          else if (file.name.endsWith('.css'))  return css();
          else if (file.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
        }
        const theme = editorTheme === 'dark' ? oneDark : clouds;
        
        const access = () => {
          if (user?.position === 'Student') {
            return EditorState.readOnly.of(!checkTimeframe(openTimeRef.current, closeTimeRef.current));
          } else if (user?.position === 'Professor') {
            return EditorState.readOnly.of(true);
          }          
        }

        if (checkTimeframe(openTimeRef.current, closeTimeRef.current) === false) {
          setWarning(2);
        }
        
        providerRef.current.on('synced', () => {
          const users_length = Array.from(providerRef.current.awareness.getStates().values()).length;

          const ytext = ydoc.getText('codemirror');
          let initialContent = ytext.toString();
          if (((initialContent === '' || initialContent === null) && users_length === 1)) {
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
          if (user.position === 'Student') {
            editor_div.addEventListener('keydown', editorListener);
          }

          providerRef.current.awareness.on('change', () => {  
            updateAwareness();
          });
        });
      };
      init();

    } catch (e) {
      alert('Connection to websocket has failed. Please refresh the page.');
    }
      
    socket.emit('join_editor', {
      room_id,
      file_id: file.file_id,
      user_id: user.uid
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
              EditorState.readOnly.of(!checkTimeframe(new_open_time, new_close_time))
            ])
        });
      }      
    });

    return () => {
      socket.off('update_result');
      socket.off('dates_updated');
      socket.off('editor_users_updated');

      if (file) {
        socket.emit('leave_editor', {file_id: file?.file_id })
      }
      if (user.position === 'Student') {
        document.getElementById('editor-div')?.removeEventListener('keydown', editorListener);
      }
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
    changeTheme(editorRef, editorTheme, themeCompartmentRef);
  }, [editorTheme]);
      
  useEffect(() => {
    storeInHistory = true;
    
    const interval = setInterval(() => {
      storeInHistory = true;
    }, 30000);

    return () => {
      clearInterval(interval);
    }
  }, [file, editorRef.current]);

  function updateCode (e) {
    let isEmpty = e.state.doc.toString() === '' && e.state.doc === null;
    let allSpaces = new RegExp('^\\s*$').test(e.state.doc.toString());

    if (e.state.doc && !isEmpty && !allSpaces) {
      setSaved( <label id='saving'>Saving...</label>);
      
      const code = e.state.doc.toString();

      socket.emit('update_code', {
        file_id: file.file_id,
        code: code,
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