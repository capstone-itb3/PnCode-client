import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import manageResizes from './utils/manageResizes';
import Options from './Options';
import FileDrawer from './FileDrawer';
import Notepad from './Notepad';
import Members from './Members';
import Instructions from './Instructions';
import EditorTab from './EditorTab';
import TabOutput from './TabOutput';
import History from './History';
import Chats from './Chats';
import Feedback from './Feedback';
import Switch from './Switch';

function AssignedRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser] = useState(getClass(auth, auth.position));
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  const [members, setMembers] = useState ([]);
  const [access, setAccess] = useState(null);
  
  const [activity, setActivity] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [open_time, setOpenTime] = useState(null);
  const [close_time, setCloseTime] = useState(null);

  const [activeFile, setActiveFile] = useState(null);
  const [cursorColor, setCursorColor] = useState(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [editorUsers, setEditorUsers]  = useState([]);
  const socketRef = useRef(null);
  const outputRef = useRef(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [addNewFile, setAddNewFile] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [editorTheme, setEditorTheme] = useState(Cookies.get('theme') || 'dark');
  
  useEffect(() => {    
    // if (!window.location.pathname.endsWith('/')) {
    //   const added_slash = `${window.location.pathname}/`;
    //   navigate(added_slash);
    // }

    if (user?.position === 'Student') {
      disableCopyPaste();
    }   

    async function initRoom () {
      const info = await user.getAssignedRoomDetails(room_id);
      setRoom(info.room);
      setRoomFiles(info.files);
      setMembers(info.members);
      setAccess(info.access);

      setActivity(info.activity);
      setInstructions(info.activity.instructions);
      setOpenTime(info.activity.open_time);
      setCloseTime(info.activity.close_time);

      document.title = info.activity.activity_name;

      if (info.access) {
        socketRef.current = await initSocket();
        
        socketRef.current.emit('join_room', { 
          room_id, 
          user_id: user.uid,
          first_name: user.first_name,
          last_name: user.last_name,
          position: user.position
        })
  
        socketRef.current.on('room_users_updated', ({ users }) => {
          setRoomUsers(users);
          setCursorColor(users.find((u) => u.user_id === user.uid)?.cursor);
        })  
  
        socketRef.current.on('found_file', ({ file }) => {
          setActiveFile(file);
        });
    
        if (info.files.length > 0) {
          displayFile(info.files[0]);
        }
      } else {
        windows.location.href = '/error/404';
      }
    }
    initRoom();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('found_file');
        socketRef.current.off('room_users_updated');
        socketRef.current.off('editor_users_updated');
        socketRef.current.disconnect();
      }

      setRoom(null);
      setRoomFiles([]);
      setMembers([]);
      setAccess(null);
      setActivity(null);
      setActiveFile(null);
      setCursorColor(null);
      setRoomUsers([]);
      setEditorUsers([]);
      setAddNewFile(false);
      setDeleteFile(false);
      socketRef.current = null;
    }
  }, [room_id]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('editor_users_updated', ({ editors }) => {
        setEditorUsers(editors);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('editor_users_updated');
      } 
    };
  }, [activeFile]);  

  useEffect(() => {
    manageResizes(leftDisplay, rightDisplay);
  }, [leftDisplay, rightDisplay]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        runOutput();
        return;
      }

      if (event.altKey && event.key === 'f') {
        event.preventDefault();
        setLeftDisplay('files');
        return;
      }

      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        setLeftDisplay('notepad');
        return;
      }

      if (event.altKey && event.key === 'o') {
        event.preventDefault();
        setRightDisplay('output');
        return;
      }

      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        setRightDisplay('history');
        return;
      }

      if (event.altKey && event.key === 'b') {
        event.preventDefault();
        setRightDisplay('feedback');
        return;
      }

      if (user?.position === 'Student' && event.altKey && event.key === 'a') {
        event.preventDefault();
        setAddNewFile(true);
        setDeleteFile(false);
        setLeftDisplay('files');
        return;
      }
      
      if (event.altKey && event.key === 'l') {
        if (leftDisplay === '') {
          setLeftDisplay('files');
        } else {
          setLeftDisplay('');
        }
      }
      if (event.altKey && event.key === 'p') {
        if (rightDisplay === '') {
          setRightDisplay('output');
        } else {
          setRightDisplay('');
        }
      }

      if (user?.position === 'Student' && event.altKey && event.key === 'x') {
        event.preventDefault();
        setDeleteFile(true);
        setAddNewFile(false);
        setLeftDisplay('files');
        return;
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

  function displayFile(file) {
    if (file === null) {
      setActiveFile(null);
      return;
    }

    socketRef.current.emit('find_file', {
      room_id,
      file_id: file.file_id
    });
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
        }  
      }
    }
  }
  
  function leaveRoom () {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (user?.position === 'Student') {
      navigate (`/dashboard/${activity.class_id}/all`);

    } else if (user?.position === 'Professor'){
      navigate (`/activity/${activity.activity_id}`);
    }
  }  

  return (
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && activity && members && access && socketRef.current &&
            <Options 
              type={'assigned'} 
              room={room} 
              user={user}
              socket={socketRef.current}
              open_time={activity.open_time}
              close_time={activity.close_time}
              setLeftDisplay={setLeftDisplay}
              setRightDisplay={setRightDisplay}
              reloadFile={() => displayFile(activeFile)}
              setEditorTheme={setEditorTheme}
              outputRef={outputRef}
              setAddNewFile={setAddNewFile}
              setDeleteFile={setDeleteFile}
              runOutput={runOutput}/>
          }
          </div>
          {activity && user.position === 'Student' &&
            <div className='items-center room-logo single-line'>
              {activity.activity_name}
            </div>
          }
          {activity && user.position === 'Professor' &&
            <Switch room={room} activity={activity} />
          }

        {room && activity &&
          <div className='items-center'>
            <button className='room-header-options items-center' onClick={ leaveRoom }>
              <VscDebugDisconnect size={23} color={ '#f8f8f8' } /><span>Leave</span> 
            </button>
          </div>
        }
      </div>
      {!(room && activity && members && access && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && activity && members && access && socketRef.current &&
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
                <button className={`side-tab-button ${leftDisplay === 'notepad' && 'active'}`} 
                        onClick={() => setLeftDisplay('notepad')}>
                        Notepad
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
                  displayFile={displayFile}
                  addNewFile={addNewFile}
                  setAddNewFile={setAddNewFile}
                  deleteFile={deleteFile}
                  setDeleteFile={setDeleteFile}
                  editorUsers={editorUsers}
                  roomUsers={roomUsers}/>
              }
              {leftDisplay === 'notepad' &&
                <Notepad 
                  room={room} 
                  user={user} 
                  socket={socketRef.current}
                  cursorColor={cursorColor}/>
              }
              </div>
            <Members 
              members={members}
              roomUsers={roomUsers}/>
          </aside>
          <div className='flex-column' id='center-body'>
            <Instructions 
              instructions={instructions} 
              setInstructions={setInstructions}
              socket={socketRef.current}/>
            <div className='flex-row' id='editor-section'>
              <EditorTab 
                room={room}
                user={user}
                cursorColor={cursorColor}
                socket={socketRef.current}
                open_time={open_time}
                close_time={close_time}
                activeFile={activeFile}
                editorTheme={editorTheme}/>
              <div className={`flex-column ${rightDisplay === '' && 'none'}`} id='right-body'>
                <div className='side-tab-buttons flex-row'>
                  <button className='remove-side-tab items-center' onClick={() => setRightDisplay('')}>
                    <BsXLg size={14}/>
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'output' && 'active'}`}
                          onClick={() => setRightDisplay('output')}>
                          Output
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'history' && 'active'}`} 
                          onClick={() => setRightDisplay('history')}>
                          History
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'feedback' && 'active'}`}
                          onClick={() => setRightDisplay('feedback')}>
                          Feedback
                  </button>
                </div>
                <div id='right-section'>
                  <TabOutput 
                    rightDisplay={rightDisplay}
                    outputRef={outputRef}/> 
                  {activeFile &&
                    <History
                    user={user}
                    rightDisplay={rightDisplay}
                    socket={socketRef.current}
                    file={activeFile}/>                         
                  }
                  <Feedback 
                    user={user}
                    room={room}
                    socket={socketRef.current}
                    rightDisplay={rightDisplay}
                    setRightDisplay={setRightDisplay}/>
                </div>
              </div>
            </div>
          </div>
          {user && user?.position === 'Student' &&
            <Chats room={room} user={user} socket={socketRef.current}/>
          }
        </div>
      }
    </main>  
  )
}

export default AssignedRoom