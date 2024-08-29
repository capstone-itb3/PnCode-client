import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
// import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import Options from './Options';
import Notepad from './Notepad';
import Members from './Members';
import Editor from './Editor';


function RoomStudent({auth}) {   
  const { room_id } = useParams();
  const [student, setStudent] = useState(getClass(auth, 'Student'));
  const [room, setRoom] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [members, setMembers] = useState ([]);
  const [access, setAccess] = useState(null);

  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

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

    const newSocket = io(import.meta.env.VITE_APP_BACKEND_URL);
    setSocket(newSocket);
  
    // newSocket.emit('join_room', room_id);
  
  }, []);

  return (
    <> 
      {room && instructions && members && access && socket &&
        (<main className='room-main'>
          <Options type='assigned' room={room} user={student}/>        
          <aside id='side-lists'>
            <Notepad room={room} user={student} socket={socket}/>
            <Members members={members}/>
          </aside>
            <section id='editor-section'>
              {/* <div id='output-div'>
                <div className='output-header'>
                  <label>Output</label>
                  <div className='items-center'>
                    <button className='output-btn items-center' id='hide-btn' onClick={ hideView } >—</button>
                    <button className='output-btn items-center' id='full-btn' onClick={ fullView } >
                      <ImArrowUpRight2 color={'#505050'}size={17}/>
                    </button>
                  </div>
                </div>
                <iframe title= 'Displays Output' id='output-iframe'/>
              </div> */}
              <div id='editor-div'>
              </div>
            </section>
        </main>  
        )
      }
    </>
  )
}

export default RoomStudent