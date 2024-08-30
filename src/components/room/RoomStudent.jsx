import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
// import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import Options from './Options';
import FileDrawer from './FileDrawer';
import Notepad from './Notepad';
import Members from './Members';
import EditorTab from './EditorTab';

function RoomStudent({auth}) {   
  const { room_id } = useParams();
  const [student, setStudent] = useState(getClass(auth, 'Student'));
  const [room, setRoom] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [members, setMembers] = useState ([]);
  const [activeMembers, setActiveMembers] = useState ([]);
  const [activeFile, setActiveFile] = useState(null);
  const [access, setAccess] = useState(null);
  const [leftDisplay, setLeftDisplay] = useState('files');
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    disableCopyPaste();

    async function initRoom () {
      const data_info = await student.getAssignedRoomDetails(room_id);
      setRoom(data_info.room);
      setInstructions(data_info.instructions);
      setMembers(data_info.members);
      setAccess(data_info.access);
      setActiveFile(data_info.room.files[0]);
    }
    initRoom();
  }, []);

  useEffect(() => {
    if (room && access) {
      // const newSocket = io(import.meta.env.VITE_APP_BACKEND_URL);
      // socketRef.current = newSocket;
      
      setSocketConnected(true);

      // return () => {
      //   socketRef.current.disconnect();
      // }  
    }
  }, [access, room])

  function addToActiveMembers(member) {
    setActiveMembers(member);
  }

  function leftDisplaySwitch () {

  }

  return (
    <> 
      {room && instructions && members && access && socketConnected && activeFile &&
        (<main className='room-main'>
          <Options type='assigned' room={room} user={student}/>        
          <aside id='side-lists'>
            <div className='left-side-tab top'>
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
            {leftDisplay === 'files' &&
              <FileDrawer 
                room={room} 
                activeFile={activeFile}
                setActiveFile={setActiveFile}/>
            }
            {leftDisplay === 'notepad' &&
              <Notepad 
                room={room} 
                user={student} 
                socket={socketRef.current}/>
            }
              </div>
            <Members 
              members={members} 
              activeMembers={activeMembers}/>
          </aside>
          <EditorTab 
            room={room} 
            user={student} 
            socket={socketRef.current} 
            activeFile={activeFile}
            addToActiveMembers={addToActiveMembers}/>
        </main>  
        )
      }
    </>
  )
}

export default RoomStudent