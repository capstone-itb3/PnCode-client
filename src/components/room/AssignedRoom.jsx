import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { getToken, getClass } from '../validator';
import { showConfirmPopup } from '../reactPopupService';
import convertTime from '../dashboard/utils/convertTime';
import disableCopyPaste from './utils/disableCopyPaste';
import { handleKeyDownAssigned } from './utils/roomHandleKeyDown';
import { runOutput, runOutputFullView } from './utils/runOption';
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
import checkTimeframe from './utils/checkTimeframe';

async function socketConnectError(error_type) {
  const reload = await showConfirmPopup({
    title: `Connection ${error_type}`,
    message: `An ${String(error_type).toLowerCase()} occured while connecting to socket.`,
    confirm_text: 'Reload',
    cancel_text: 'Dashboard'
  });

  if (reload === true) {
    window.location.reload();
  } else if (reload === false) {
    window.location.href = '/dashboard';
  }
}

function AssignedRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser] = useState(getClass(auth, auth.position));
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  const [members, setMembers] = useState ([]);
  
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  const [activity, setActivity] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [timeframes, setTimeframes] = useState([]);
  const [activityOpen, setActivityOpen] = useState(null);

  const [activeFile, setActiveFile] = useState(null);
  const [cursorColor, setCursorColor] = useState(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [editorUsers, setEditorUsers]  = useState([]);
  const outputRef = useRef(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [addNewFile, setAddNewFile] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [editorTheme, setEditorTheme] = useState(Cookies.get('theme') || 'dark');
  
  useEffect(() => {    
    if (user?.position === 'Student') {
      disableCopyPaste();
    }   

    async function initRoom () {
      const info = await user.getAssignedRoomDetails(room_id);

      if (!info.access) {
        navigate('/error/404');
        return;
      }
      
      setRoom(info.room);
      setRoomFiles(info.files);
      setMembers(info.members);

      setActivity(info.activity);
      setInstructions(info.activity.instructions);
      setTimeframes([info.activity.open_time, info.activity.close_time]);
      document.title = info.activity.activity_name;

      if (info.access) {
        socketRef.current = await initSocket();

        socketRef.current.on('connect_timeout', () => {
          console.log('Connection timeout');
          socketConnectError('Timeout');
        });

        socketRef.current.on('error', (error) => {
          console.log('Socket error:', error);
          socketConnectError('Error');
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
        socketRef.current.off('connect_error');
        socketRef.current.off('connect_timeout');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }

      setRoom(null);
      setRoomFiles([]);
      setMembers([]);
      setActivity(null);
      setActivityOpen(null);
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
    if (!user || !socketRef.current) {
      return;
    }

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', { 
        room_id, 
        user_id: user.uid,
        first_name: user.first_name,
        last_name: user.last_name,
        position: user.position
      });

      if (activeFile !== null) {
        socketRef.current.emit('join_editor', {
          room_id,
          file_id: activeFile.file_id,
          user_id: user.uid
        });
      }
    });
    
    socketRef.current.on('get_socket_id', ({ socket_id }) => {
      setSocketId(socket_id);
    });
    
    socketRef.current.on('room_users_updated', ({ users, message }) => {
      setRoomUsers(users);
      setCursorColor(users.find((u) => u.user_id === user.uid)?.cursor);

      if (message) {
        toast.success(message);
      }
    });  

    socketRef.current.on('found_file', ({ file }) => {
      setActiveFile(file);
    });

    socketRef.current.on('editor_users_updated', ({ editors }) => {
      setEditorUsers(editors);
    });

    socketRef.current.on('dates_updated', ({ new_open_time, new_close_time }) => {
      setTimeframes([new_open_time, new_close_time]);
      toast.success(`Activity dates updated to ${convertTime(new_open_time)} - ${convertTime(new_close_time)}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('found_file');
        socketRef.current.off('room_users_updated');
        socketRef.current.off('dates_updated');
        socketRef.current.off('editor_users_updated');
      }
    }
  }, [socketRef.current, activeFile]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (user?.position === 'Student') {
        if (event.altKey && event.key === 'a') {
          event.preventDefault();
          setAddNewFile(true);
          setDeleteFile(false);
          setLeftDisplay('files');
          return;
        }
        if (event.altKey && event.key === 'x') {
          event.preventDefault();
          setDeleteFile(true);
          setAddNewFile(false);
          setLeftDisplay('files');
          return;
        }
      }

      handleKeyDownAssigned(event, setLeftDisplay, setRightDisplay, room_files, displayFile, startRunOutput, startRunOutputFullView);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [room_files, activeFile]);

  useEffect(() => {
    if (!activity || timeframes.length === 0) {
      return;
    }
  
    async function toggleActivityTimeframe() {
      const open = checkTimeframe(timeframes[0], timeframes[1]);
      setActivityOpen(open);
    }
    toggleActivityTimeframe();

    const interval = setInterval(toggleActivityTimeframe, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [timeframes, activity]);

  useEffect(() => {
    console.log(activityOpen);
  }, [activityOpen]);
    
  function displayFile(file) {
    if (file === null || activeFile?.file_id === file?.file_id) {
      !file ? setActiveFile(null) : null;
      return;
    }

    socketRef.current.emit('find_file', {
      room_id,
      file_id: file.file_id
    });
  }

  function startRunOutput() {
    runOutput(outputRef.current, room_id, room_files, activeFile);
  }

  function startRunOutputFullView() {
    runOutputFullView(room_id, room_files, activeFile);
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

    toast.success('You have left the room.');
  }  

  return (
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && activity && members && socketRef.current &&
            <Options 
              type={'assigned'} 
              room={room} 
              user={user}
              socket={socketRef.current}
              activityOpen={activityOpen}
              setLeftDisplay={setLeftDisplay}
              setRightDisplay={setRightDisplay}
              reloadFile={() => displayFile(activeFile)}
              setEditorTheme={setEditorTheme}
              outputRef={outputRef}
              setAddNewFile={setAddNewFile}
              setDeleteFile={setDeleteFile}
              startRunOutput={startRunOutput}
              startRunOutputFullView={startRunOutputFullView}/>
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
      {!(room && activity && members && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && activity && members && socketRef.current && (activityOpen !== null) && 
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
          <div className={`flex-column ${leftDisplay === '' && 'larger'}`} id='center-body'>
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
                activityOpen={activityOpen}
                activeFile={activeFile}
                editorTheme={editorTheme}
                rightDisplay={rightDisplay}/>
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
                    outputRef={outputRef}
                    startRunOutputFullView={startRunOutputFullView}/>
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
                    socketId={socketId}
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