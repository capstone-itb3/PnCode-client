import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { javascript } from '@codemirror/lang-javascript'
import { html, htmlLanguage } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from './utils/JSesLint'
import { html5Snippet, jquerySnippet, bootstrapSnippet } from './utils/codeSnippets';
import { noText, editedLine, editedLineText } from './utils/codeChecker';
import { nonEditingKey, editingKey, unknownKey } from './utils/keyHandler';
import changeTheme from './utils/changeTheme';
import _ from 'lodash'

function Editor({ user, cursorColor, file, socket, activityOpen, setSaved, editorTheme, warning, setWarning}) {
  const { room_id } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const themeCompartmentRef = useRef(new Compartment());
  const readOnlyCompartmentRef = useRef(new Compartment());
  const inSameLineRef = useRef(false);
  const storeInHistoryRef = useRef(false);
  const previousLineRef = useRef({});

  const editorListener = (event) => {
    try {
      const onTime = activityOpen;    

      //Ctrl + S to save the code
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onTime ? updateCode(editorRef.current, false) : null;
        return;
      }

      if (!nonEditingKey(event) && (event.key.length === 1 || editingKey(event.key) || unknownKey(event.key))) {
        updateAwareness(editorRef.current?.state?.doc?.lineAt(editorRef.current?.state?.selection?.main?.head)?.number || 1);

        //check the readOnly config and will be used to minimize the number of times the editor
        //...is updated so it can only be updated when readOnly must be in opposite state
        const currentConfig = readOnlyCompartmentRef.current.get(editorRef.current.state)[0].value;

        //first checks if the cursor is not the same line as other user's cursor and
        //...the current time is within the open and close time
        if (!inSameLineRef.current && onTime) {
          //if yes, it then checks if the current config of readOnly is true 
          if (currentConfig === true) {
            //if currently true, it then modifies the readOnly state of the editor to false
            editorRef.current?.dispatch({
              effects: readOnlyCompartmentRef.current.reconfigure([
                EditorState.readOnly.of(false)
              ])
            });
          }
          warning !== 0 ? setWarning(0) : null;
          updateCode(editorRef.current, event.key);

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
  }

  function updateAwareness(new_line) {
    if (!providerRef.current || !editorRef.current) {
      return;
    }

    try {
      let allOtherUsers = Array.from(providerRef.current.awareness.getStates().values())
                                .map(state => state.user);
  
      allOtherUsers = allOtherUsers.filter((u) => {
        const notUndefined = u !== undefined;
        const notMe = u?.userId !== user.uid;
        const notLineOne = Number(u?.line) > 1;
        const isEditing = u?.position !== 'Professor';
  
        return notUndefined && notMe && notLineOne && isEditing;
      });
      
      inSameLineRef.current = allOtherUsers.some(u => Number(u.line) === Number(new_line));

      providerRef.current.awareness.setLocalStateField('user', {
        ...providerRef.current.awareness.getLocalState().user,
        line: !inSameLineRef.current ? new_line : 0,
      });  
  
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
          if      (file.name.endsWith('.html')) return [html(), htmlLanguage.data.of({ autocomplete: [html5Snippet, jquerySnippet, bootstrapSnippet ] }),]; 
          else if (file.name.endsWith('.css'))  return css();
          else if (file.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
        }
        const theme = editorTheme === 'dark' ? oneDark : clouds;
        
        const access = () => {
          if (user?.position === 'Student') {
            return EditorState.readOnly.of(!activityOpen);
          } else if (user?.position === 'Professor') {
            return EditorState.readOnly.of(true);
          }          
        }

        if (activityOpen === false) {
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
              EditorView.lineWrapping,
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
          providerRef.current.awareness.on('change', () => {
            updateAwareness(editorRef.current?.state?.doc?.lineAt(editorRef.current?.state?.selection?.main?.head)?.number || 1);

            if (user.position === 'Student') {
              editor_div.addEventListener('keydown', editorListener);
            }  
          });

          setSaved(<label id='saving'>Successfully connected.</label>);
        });

        providerRef.current.on('connection-close', () => {
          console.warn('YJS Connection Closed.');
          providerRef.current.connect();
        });

        providerRef.current.on('connection-error', (error) => {
          console.error('YJS Connection Error:', error);
          setWarning(5);
        });
      };
      init();

      socket.emit('join_editor', {
        room_id,
        file_id: file.file_id,
        user_id: user.uid
      });
    } catch (e) {
      alert('Connection to websocket has failed. Please refresh the page.');
    }
      
    return () => {      
      setWarning(0);
      setSaved(null);  

      if (user.position === 'Student') {
        document.getElementById('editor-div')?.removeEventListener('keydown', editorListener);
      }
      if (file) {
        socket.emit('leave_editor', { file_id: file?.file_id })
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
  }, [file, activityOpen, socket]);

  useEffect (() => {
    socket.on('update_result', ({ status }) => {
      if (status === 'ok') {
        setSaved( <label className='items-center' id='saved'>
                    <BsCheck2 size={14}/><span>Saved!</span>
                  </label>
                );
      } else {
        setSaved( <label className='items-center' id='unsaved'>
                    <BsExclamationTriangleFill size={13}/><span>Unsaved.</span>
                  </label>
                );
      }
    });

    return () => {
      socket.off('update_result');
    }
  }, [socket, file]);

  useEffect(() => {
    changeTheme(editorRef, editorTheme, themeCompartmentRef);
  }, [editorTheme]);
      
  useEffect(() => {
    storeInHistoryRef.current = true;
    
    const interval = setInterval(() => {
      storeInHistoryRef.current = true;
    }, 300000);

    return () => {
      clearInterval(interval);
    }
  }, [file, editorRef.current]);

  const updateCode = _.debounce((editor, key) => {
    const code = editor?.state?.doc;

    if (!code) return;
    if (noText(code.toString())) return setWarning(1);

    const line = editedLine(editor, key);
    const text = editedLineText(line, code, key);

    if (key !== false) {
      if (previousLineRef.current.line === line && previousLineRef.current.text === text) {
        return;
      }
      previousLineRef.current = { line, text };
    }
    setSaved( <label id='saving'>Saving...</label>);

    socket.emit('update_code', {
      file_id: file.file_id,
      code: code.toString(),
      user_id: user.uid,
      first_name: user.first_name,
      last_name: user.last_name,
      room_id: room_id,
      line: line,
      text: text,
      store_history: storeInHistoryRef.current
    });

    storeInHistoryRef.current = false;

    setWarning(0);
  }, 300);
  
  return (
    <>
      <div id='editor-div'>
      </div>
    </>
  )
}

export default React.memo(Editor);