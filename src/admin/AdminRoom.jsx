import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { initSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import getAdminClass from './utils/adminValidator';
import { handleKeyDownAssigned } from '../components/room/utils/roomHandleKeyDown';
import { runOutput, runOutputFullView } from '../components/room/utils/runOption';
import FileDrawer from '../components/room/FileDrawer';
import TabOutput from '../components/room/TabOutput';
import Members from '../components/room/Members';
import Instructions from '../components/room/Instructions';
import Options from './room/AdminOptions';
import Notepad from './room/AdminNotepad';
import EditorTab from './room/AdminEditorTab';
import History from './room/AdminHistory';
import Chats from './room/AdminChats';
import Feedback from './room/AdminFeedback';

function AdminRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getAdminClass());
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  const [members, setMembers] = useState ([]);
  
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
    async function initRoom () {
      const info = await admin.getAssignedRoomDetails(room_id);
      setRoom(info.room);
      setRoomFiles(info.files);
      setMembers(info.members);

      setActivity(info.activity);
      setInstructions(info.activity.instructions);
      setOpenTime(info.activity.open_time);
      setCloseTime(info.activity.close_time);

      document.title = `PnCode Admin - ${info.activity.activity_name}`;

      socketRef.current = await initSocket();
      
      socketRef.current.emit('join_room', { 
        room_id: info.room.room_id, 
        user_id: 'user_admin',
        first_name: 'PnCode',
        last_name: 'Admin',
        position: 'Admin'
      })

      socketRef.current.on('room_users_updated', ({ users }) => {
          setRoomUsers(users);
          setCursorColor(users.find((u) => u.user_id === 'user_admin')?.cursor || '#808080');
      });
  
      socketRef.current.on('found_file', ({ file }) => {
        setActiveFile(file);
      });
    
      if (info.files.length > 0) {
        displayFile(info.files[0]);
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
    }
  }, [room_id]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('editor_users_updated', ({ editors }) => {
        setEditorUsers(editors);
      });
  
      return () => {
        socketRef.current.off('editor_users_updated');
      };
    }
  }, [activeFile]);  

  useEffect(() => {
    const handleKeyDown = (event) => {
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
      
      handleKeyDownAssigned(event, setLeftDisplay, setRightDisplay, room_files, displayFile, startRunOutput, startRunOutputFullView);
    }

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
      navigate(`/admin/dashboard/activity/${activity.activity_id}/assigned-rooms/${room.room_id}/`);
  }  

  return (
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && activity && socketRef.current &&
            <Options 
              type={'assigned'} 
              room={room} 
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
              startRunOutput={startRunOutput}
              startRunOutputFullView={startRunOutputFullView}/>
          }
          </div>
          {room && activity &&
          <>
            <div className='items-center room-logo single-line'>
              {activity.activity_name}
            </div>
            <div className='items-center'>
              <button className='room-header-options items-center' onClick={ leaveRoom }>
                <VscDebugDisconnect size={23} color={ '#f8f8f8' } /><span>Leave</span> 
              </button>
            </div>
          </>
          }
      </div>
      {!(room && activity && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && activity && socketRef.current &&
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
                cursorColor={cursorColor}
                socket={socketRef.current}
                open_time={open_time}
                close_time={close_time}
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
                      rightDisplay={rightDisplay}
                      socket={socketRef.current}
                      file={activeFile}/>                         
                  }
                  <Feedback 
                    room={room}
                    socket={socketRef.current}
                    rightDisplay={rightDisplay}
                    setRightDisplay={setRightDisplay}/>
                </div>
              </div>
            </div>
          </div>
          <Chats room={room} socket={socketRef.current}/>
        </div>
      }
    </main>  
  )
}

export default AdminRoom