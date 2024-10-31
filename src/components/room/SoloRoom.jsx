import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg, BsCheck2, BsExclamationTriangleFill } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import manageResizes from './utils/manageResizes';
import Options from './Options';
import FileDrawer from './FileDrawer';
import Members from './Members';
import TabOutput from './TabOutput';
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

function AssignedRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser] = useState(getClass(auth, auth.position));
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  
  const [activeFile, setActiveFile] = useState(null);

  const socketRef = useRef(null);
  const outputRef = useRef(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [editorTheme, setEditorTheme] = useState(Cookies.get('theme') || 'dark');
  
  const [warning, setWarning] = useState(0);
  const [saved, setSaved] = useState(null);
  const editorRef = useRef(null);
  const compartmentRef = useRef(new Compartment());

  useEffect(() => {    
    if (!window.location.pathname.endsWith('/')) {
      const added_slash = `${window.location.pathname}/`;
      navigate(added_slash);
    }

    if (user?.position === 'Student') {
      disableCopyPaste();
    }   

    async function initRoom () {
      const info = await user.getSoloRoomDetails(room_id);
      setRoom(info);
      setRoomFiles(info.files);

      displayFile(info.files[0]);
      document.title = info.room_name;
    }
    initRoom();

    async function init() {
      socketRef.current = await initSocket();
    
      socketRef.current.on('update_result_solo', ({ status }) => {
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
    }
    init();

    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('update_token');
        socketRef.current.off('update_result');
        socketRef.current.disconnect();
      }
    }
  }, []);

  useEffect(() => {
    manageResizes(leftDisplay, rightDisplay);
  }, [leftDisplay, rightDisplay]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'r') {
        runOutput();
        return;
      }

      if (event.altKey && event.key === 'f') {
        event.preventDefault();
        setLeftDisplay('files');
        return;
      }

      if (event.altKey && event.key === 'o') {
        event.preventDefault();
        setRightDisplay('output');
        return;
      }

      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        if (leftDisplay === '') {
          setLeftDisplay('files');
        } else {
          setLeftDisplay('');
        }
      }
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        if (rightDisplay === '') {
          setRightDisplay('output');
        } else {
          setRightDisplay('');
        }
      }

      for (let i = 1; i <= room_files.length && i <= 10; i++) {
        if (event.altKey && event.key === i.toString()) {
          event.preventDefault();
          displayFile(room_files[i - 1]);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [room_files, activeFile]);

  useEffect(() => {
    if (activeFile) {

      const type = () => {
        if      (activeFile.name.endsWith('.html')) return html(); 
        else if (activeFile.name.endsWith('.css'))  return css();
        else if (activeFile.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
      }
      const theme = editorTheme === 'dark' ? oneDark : clouds;

      const state = EditorState.create({
        doc: activeFile.content,
        extensions: [
          keymap.of([indentWithTab]),
          basicSetup,
          type(),
          compartmentRef.current.of([theme]),
          lintGutter(),
          EditorView.updateListener.of(e => {
            if (e.docChanged) {
              updateCode(e);
            }
          }),
        ]
      });

      const editor_div = document.getElementById('editor-div');
      editor_div.innerHTML = '';
      
      editorRef.current = new EditorView({ state, parent: (editor_div) });
    }
  }, [activeFile]);

  useEffect(() => {
    if (editorRef.current) {
      const theme = editorTheme === 'dark' ? oneDark : clouds;
      editorRef.current.dispatch({
        effects: compartmentRef.current.reconfigure([theme])
      });
    }
  }, [editorTheme]);


  function displayFile(file) {
    if (file === null) {
      setActiveFile(null);
      return;
    }
    setActiveFile(file);
  }

  function updateCode(e) {
    if (activeFile) {
      const content = e.state.doc.toString();
      const file_updated = { ...activeFile, content };

      setRoomFiles(room_files.map(f => f.name === activeFile.name ? file_updated : f));

      setSaved( <label id='saving'>Saving...</label>);

      socketRef.current.emit('update_code_solo', {
        room_id: room_id,
        file_id: activeFile.file_id,
        content: content,
      });
    }
  }

  function runOutput() {
    setRightDisplay('output');

    if (activeFile.type === 'html') {
      outputRef.current.src = `/view/${room_id}/${activeFile.name}`;

    } else {
      if (activeFile.type !== 'html') {      
        let active = room_files.find((f) => f.type = 'html');
  
        if (active) {
          outputRef.current.src = `/view/${room_id}/${active.name}`;
        } else {
          outputRef.current.src = null;
          toast.error('No html file found.');
        }  
      }
    }
  }
  
  function leaveRoom () {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate('/dashboard');
  }

  return (
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && socketRef.current &&
            <Options 
              type={'solo'}
              room={room}
              user={user}
              socket={socketRef.current}
              setLeftDisplay={setLeftDisplay}
              setRightDisplay={setRightDisplay}
              setEditorTheme={setEditorTheme}
              outputRef={outputRef}
              runOutput={runOutput}/>
          }
          </div>
          {room &&
            <div className='items-center room-logo single-line'>
              {room.room_name}
            </div>
          }
          <div className='items-center'>
            <button className='room-header-options items-center' onClick={ leaveRoom }>
              <VscDebugDisconnect size={23} color={ '#f8f8f8' } /><span>Leave</span> 
            </button>
          </div>
      </div>
      {!(room && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && socketRef.current &&
        <div id='editor-tab' className='flex-row'>
          <aside className={`flex-column ${leftDisplay === '' && 'none'}`} id='left-body'>
            <div className='flex-column side-tab top'>
              <div className='side-tab-buttons flex-row'>
                <button className='remove-side-tab items-center' onClick={() => setLeftDisplay('')}>
                  <BsXLg size={14}/>
                </button>
                <button className={`side-tab-button ${leftDisplay === 'files' && 'active'}`}
                        onClick={() => setLeftDisplay('files')}>
                        Files
                </button>
              </div>
              {leftDisplay === 'files' &&
                <FileDrawer 
                  room={room} 
                  user={user}
                  socket={socketRef.current}
                  room_files={room_files}
                  setRoomFiles={setRoomFiles}
                  activeFile={activeFile}
                  displayFile={displayFile}/>
              }
              </div>
              <Members 
                members={[user]}
                roomUsers={[{ user_id: user.uid, cursor: { color: 'red' } }]}
                inSolo={true}/>
          </aside>
          <div className='flex-column' id='center-body'>
            <div className='flex-row' id='editor-section'>
              <div id='editor-container' className={`flex-column  ${editorTheme !== 'dark' && 'light'}`}>
                <div className='file-name-container items-start'>
                  <div id='file-name'>
                      {activeFile &&
                          <label>{activeFile.name}</label>
                      } 
                      {!activeFile &&
                          <label>No file selected.</label>
                      }
                  </div>
                  {activeFile && warning === 1 &&
                  <div id='file-warning'>
                          <label className='single-line items-center'>
                              <BsExclamationTriangleFill size={12}/>
                              <span>Empty documents will not be saved to prevent loss of progress.</span>
                          </label>
                  </div>
                  }
                  {activeFile && warning === 0 &&
                  <div id='save-status' className='items-center'>
                      {saved}
                  </div>
                  }
                </div>
                {activeFile &&
                  <div id='editor-div'>
                  </div>
                }
              </div>
              <div className={`flex-column ${rightDisplay === '' && 'none'}`} id='right-body'>
                <div className='side-tab-buttons flex-row'>
                  <button className='remove-side-tab items-center' onClick={() => setRightDisplay('')}>
                    <BsXLg size={14}/>
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'output' && 'active'}`}
                          onClick={() => setRightDisplay('output')}>
                          Output
                  </button>
                </div>
                <div id='right-section'>
                  <TabOutput 
                    rightDisplay={rightDisplay}
                    outputRef={outputRef}
                    activeFile={activeFile}
                    room_files={room_files}/> 
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </main>
  )
}

export default AssignedRoom