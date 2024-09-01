import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
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

function RoomStudent({auth}) {  
  const { room_id } = useParams();
  const [student, setStudent] = useState(getClass(auth, 'Student'));
  const [room, setRoom] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [members, setMembers] = useState ([]);
  const [access, setAccess] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  const socketRef = useRef(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [editorUsers, setEditorUsers]  = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const [leftDisplay, setLeftDisplay] = useState('files');
  const [addNewFile, setAddNewFile] = useState(false);
  useEffect(() => {
    disableCopyPaste();

    async function initRoom () {
      const data_info = await student.getAssignedRoomDetails(room_id);
      setRoom(data_info.room);
      setInstructions(data_info.instructions);
      setMembers(data_info.members);
      setAccess(data_info.access);
    }
    initRoom();
  }, []);

  useEffect(() => {
    if (room && access) {
      async function init() {
        socketRef.current = await initSocket();
      
        socketRef.current.on('room_users_updated', (users) => {
          setRoomUsers(users);
          console.log('room');
          console.log(users);
        });

        socketRef.current.emit('join_room', { 
          room_id, 
          user_id: student.uid 
        })

        displayFile(room.files[0]);
      }
      init();
      setSocketConnected(true);



      return () => {
        if (socketRef.current) {
          socketRef.current.off('room_users_updated');
          socketRef.current.off('editor_users_updated');  
        }
      }
    }
  }, [access, room])

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
          {room && instructions && members && access && socketConnected &&
            <Options 
              type={'assigned'} 
              room={room} 
              user={student}
              setAddNewFile={setAddNewFile}/>
          }
          </div>
          <div className  ='items-center'>
            <button className='room-header-options' onClick={ leaveRoom }>
                    <BsBoxArrowInRight size={23} color={ '#f8f8f8' } />
            </button>
          </div>
      </div>
      {!(room && instructions && members && access && socketConnected) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && instructions && members && access && socketConnected &&
        <div id='editor-tab' className='flex-row'>
          <aside className='flex-column' id='side-lists'>
            <div className='flex-column left-side-tab top'>
              <div className='left-side-tab-buttons'>
                <button className={`left-side-tab-button ${leftDisplay === 'files' && 'active'}`}
                        onClick={() => setLeftDisplay('files')}>
                        Files
                </button>
                <button className={`left-side-tab-button ${leftDisplay === 'notepad' && 'active'}`} 
                        onClick={() => setLeftDisplay('notepad')}>
                        Notepad
                </button>
              </div>
              {activeFile && leftDisplay === 'files' &&
                <FileDrawer 
                  room={room} 
                  socket={socketRef.current}
                  activeFile={activeFile}
                  displayFile={displayFile}
                  addNewFile={addNewFile}
                  setAddNewFile={setAddNewFile}/>
              }
              {leftDisplay === 'notepad' &&
                <Notepad 
                  room={room} 
                  user={student} 
                  socket={socketRef.current}/>
              }
              </div>
            <Members 
              members={members}/>
          </aside>
          <div className='flex-column' id='room-body'>
            <Instructions 
              instructions={instructions} />
            <div className='flex-row' id='editor-section'>
              <EditorTab 
              room={room} 
              user={student} 
              socket={socketRef.current} 
              activeFile={activeFile}/>              
              <TabOutput />        
            </div>
          </div>
        </div>
      }
    </main>  
  )
}

export default RoomStudent