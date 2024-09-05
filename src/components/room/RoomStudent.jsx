import React, { useEffect, useRef, useState } from 'react';
import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsBoxArrowInRight } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import Options from './Options';
import FileDrawer from './FileDrawer';
import Notepad from './Notepad';
import Members from './Members';
import Instructions from './Instructions';
import EditorTab from './EditorTab';
import TabOutput from './TabOutput';
import History from './History';

function RoomStudent({auth}) {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(getClass(auth, 'Student'));
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  const [activity, setActivity] = useState(null);
  const [members, setMembers] = useState ([]);
  const [access, setAccess] = useState(null);
  
  const [activeFile, setActiveFile] = useState(null);
  const [cursorColor, setCursorColor] = useState(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [editorUsers, setEditorUsers]  = useState([]);
  const socketRef = useRef(null);
  const outputRef = useRef(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [addNewFile, setAddNewFile] = useState(false);
  const [outputLabel, setOutputLabel] = useState('Output');

  useEffect(() => {    
    if (!window.location.pathname.endsWith('/')) {
      const added_slash = `${window.location.pathname}/`;
      navigate(added_slash);
    }
    disableCopyPaste();

    async function initRoom () {
      const data_info = await student.getAssignedRoomDetails(room_id);
      setRoom(data_info.room);
      setRoomFiles(data_info.room.files);
      setActivity(data_info.activity);
      setMembers(data_info.members);
      setAccess(data_info.access);

      document.title = data_info.activity.activity_name;
    }
    initRoom()
  }, []);

  useEffect(() => {
    if (room && access) {
      async function init() {
        socketRef.current = await initSocket();
      
        socketRef.current.emit('join_room', { 
          room_id, 
          user_id: student.uid,
        })

        socketRef.current.on('room_users_updated', (users) => {
          setRoomUsers(users);
          console.log('room');
          console.log(users);

          setCursorColor(users.find((u) => u.user_id === student.uid)?.cursor);
        })

        displayFile(room.files[0]);
      }
      init();

      return () => {
        if (socketRef.current) {
          socketRef.current.off('room_users_updated');
          socketRef.current.off('editor_users_updated');  
        }
      }
    }
  }, [access, room])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'r') {
        runOutput();
        return;
      }

      for (let i = 1; i <= room_files.length && i <= 10; i++) {
        if (event.altKey && event.key === i.toString()) {
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
    const output = document.getElementById('output-div');
    const history = document.getElementById('history-div');

    if (output && history) {
      if (rightDisplay === 'output') {
        output.style.display = 'block';
        history.style.display = 'none';
  
      } else if (rightDisplay === 'history') {
        output.style.display = 'none';
        history.style.display = 'block';
      }
    }

  }, [rightDisplay])

  function displayFile(file) {
      
    socketRef.current.emit('find_content', {
      room_id,
      file_name: file.name
    });

    socketRef.current.on('found_content', ({ file }) => {
      setActiveFile(file);
    });

    return () => {
      socketRef.current.off('find_content');
      socketRef.current.off('found_content');
    }      
  }

  function runOutput() {
    setRightDisplay('output');

    if (activeFile.type === 'html') {
      outputRef.current.src = `/view/${room_id}/${activeFile.name}`;
      setOutputLabel(`Running from ${activeFile.name}.`);

    } else {
      if (activeFile.type !== 'html') {      
        let active = room_files.find((f) => f.type = 'html');
  
        if (active) {
          outputRef.current.src = `/view/${room_id}/${active.name}`;
          setOutputLabel(`Running from ${active.name}.`);
        } else {
          outputRef.current.src = null;
          setOutputLabel('No HTML file found.');
        }  
      }
    }
  }
  
  function leaveRoom () {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    window.location.href = '/dashboard';
  }  

  return (
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && activity && members && access && socketRef.current &&
            <Options 
              type={'assigned'} 
              room={room} 
              user={student}
              outputRef={outputRef}
              setAddNewFile={setAddNewFile}
              runOutput={runOutput}/>
          }
          </div>
          {activity &&
            <div className='items-center room-logo single-line'>
              {activity.activity_name}
            </div>
          }
          <div className='items-center'>
            <button className='room-header-options' onClick={ leaveRoom }>
                    <BsBoxArrowInRight size={23} color={ '#f8f8f8' } />
            </button>
          </div>
      </div>
      {!(room && activity && members && access && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && activity && members && access && socketRef.current &&
        <div id='editor-tab' className='flex-row'>
          <aside className='flex-column' id='side-lists'>
            <div className='flex-column side-tab top'>
              <div className='side-tab-buttons'>
                <button className={`side-tab-button ${leftDisplay === 'files' && 'active'}`}
                        onClick={() => setLeftDisplay('files')}>
                        Files
                </button>
                <button className={`side-tab-button ${leftDisplay === 'notepad' && 'active'}`} 
                        onClick={() => setLeftDisplay('notepad')}>
                        Notepad
                </button>
              </div>
              {activeFile && leftDisplay === 'files' &&
                <FileDrawer 
                  room={room} 
                  socket={socketRef.current}
                  room_files={room_files}
                  setRoomFiles={setRoomFiles}
                  activeFile={activeFile}
                  displayFile={displayFile}
                  addNewFile={addNewFile}
                  setAddNewFile={setAddNewFile}/>
              }
              {leftDisplay === 'notepad' &&
                <Notepad 
                  room={room} 
                  user={student} 
                  cursorColor={cursorColor}
                  socket={socketRef.current}/>
              }
              </div>
            <Members 
              members={members}
              roomUsers={roomUsers}/>
          </aside>
          <div className='flex-column' id='room-body'>
            <Instructions 
              instructions={activity.instructions} />
            <div className='flex-row' id='editor-section'>
              <EditorTab 
                room={room} 
                user={student} 
                cursorColor={cursorColor}
                socket={socketRef.current} 
                activeFile={activeFile}
                editorUsers={editorUsers}
                setEditorUsers={setEditorUsers}/>
              <div className='flex-column' id='output-section'>
                <div className='side-tab-buttons'>
                  <button className={`side-tab-button ${rightDisplay === 'output' && 'active'}`}
                          onClick={() => setRightDisplay('output')}>
                          Output
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'History' && 'active'}`} 
                          onClick={() => setRightDisplay('history')}>
                          History
                  </button>
                </div>
                <div className='right-body'>
                  <TabOutput 
                    outputRef={outputRef}
                    outputLabel={outputLabel}/> 
                  <History/>       
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </main>  
  )
}

export default RoomStudent