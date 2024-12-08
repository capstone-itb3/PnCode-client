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
import { lintGutter } from '@codemirror/lint' 
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import handleSelectedCode from './utils/handleSelectedCode';
import { changeTheme, editorType, editorAccess, editorStyle } from './utils/editorExtensions';
import { noText, editedLine, editedLineText } from './utils/codeChecker';
import { nonEditingKey, editingKey, unknownKey } from './utils/keyHandler';
import _ from 'lodash'
import { createPortal } from 'react-dom';

function Editor({ room, user, cursorColor, file, socket, activityOpen, setSaved, editorTheme, warning, setWarning}) {
  const { room_id } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const themeCompartmentRef = useRef(new Compartment());
  const readOnlyCompartmentRef = useRef(new Compartment());
  const inSameLineRef = useRef(false);
  const storeInHistoryRef = useRef(false);
  const previousLineRef = useRef({});
  const [contextMenu, setContextMenu] = useState(null);
    
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
  }

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();    
    handleSelectedCode(e, editorRef, setContextMenu);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest('.editor-context-menu')) {
        setContextMenu(null);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

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
      
        const theme = editorTheme === 'dark' ? oneDark : clouds;

        if (activityOpen === false) setWarning(2);

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
              editorType(file.type),
              basicSetup,
              readOnlyCompartmentRef.current.of([editorAccess(user.position, activityOpen)]),
              themeCompartmentRef.current.of([theme]),
              yCollab(ytext, providerRef.current.awareness),
              lintGutter(),
              EditorView.lineWrapping,
              editorStyle
            ]
          });
          
          const editor_div = document.getElementById('editor-div');
          editor_div.innerHTML = '';
          user.position === 'Professor' ? editor_div.addEventListener('contextmenu', handleContextMenu) : null;

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
      if (user.position === 'Professor') {
        document.getElementById('editor-div')?.removeEventListener('contextmenu', handleContextMenu);
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
  }, [file, activityOpen, socket, handleContextMenu]);

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
    }, 310000);

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
  
  function quoteToFeedback(action) {
    room.quoteToFeedback(socket, contextMenu, file.name, action);
    setContextMenu(null);
  }

  return (
    <>
      <div id='editor-div'>
      </div>
      {contextMenu && createPortal(
        <div className="editor-context-menu" style={{top: contextMenu.y, left: contextMenu.x}}>
          <button onClick={() => quoteToFeedback('text')}>
            Qoute Selected Text
          </button>
          <button onClick={() => quoteToFeedback('line')}>
            Qoute Full Text from Selected Line(s)
          </button>
        </div>
        , document.body)}
    </>
  )
}

export default React.memo(Editor);