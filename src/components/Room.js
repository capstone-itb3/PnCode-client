import React, { useEffect, useRef, useState } from 'react';
import User from './structures/User';
import Editor from './structures/Editor';
import { initSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Do, Err, Is } from '../commands';
import { FiArrowUpRight, FiEdit3, FiLink } from 'react-icons/fi';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function Room() {   
  const [ users, setUser ] = useState ([]);
  const [ room_info, setRoomInfo] = useState();

  const [auth, setAuth] = useState(() => {
    const token = Cookies.get('token');
    if(token !== null) {
        const user = jwtDecode(token);
        if(!user) {
            Cookies.remove('token');
            navigate('/login');
        } else {
            return user;
        }
    } else {
        navigate('/login');
    }
  });

  const codeRef = useRef(null);  
  const socketRef = useRef(null);
  
  const navigate = useNavigate();
  const { room_id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/get-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: room_id
        })
      });
      const data = await response.json();

      if (data.room_id) {
        setRoomInfo(data);
//        document.getElementById('roomName').innerHTML = room_info.room_name;
      } else {
        console.log('No rooms found or Error');
      }
    }

    fetchData();
  }, [room_id]);


  useEffect (() => {
    const init = async () => {
       socketRef.current = await initSocket();
       socketRef.current.on(Err.CONNECTERROR, (err) => handleError(err));
       socketRef.current.on(Err.CONNECTFAILED, (err) => handleError(err));

      const handleError = (e) => {
        console.log('Error: ', e);
        toast.error('Error. Socket connection failed.');
        navigate('/dashboard');
      }

      socketRef.current.emit(Do.JOIN, {
        room_id,
        username: auth.username, 
      });

      socketRef.current.on(Is.JOINED, ({ users, username, socketId }) => {
        setUser(users);

        socketRef.current.emit(Do.SYNC, {
          code: codeRef.current,
          socketId          
        });
      });

      socketRef.current.on(Is.DISCONNECTED, ({ socketId, username }) => {
        setUser((prev) => {
          return prev.filter((user) => user.socketId !== socketId)
        })
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(Is.JOINED);
      socketRef.current.off(Is.DISCONNECTED);
    }
  }, []);

  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(room_id);
      toast.success('Copied to clipboard.');
    }
    catch(e) {
      console.log();
    }
  }

  const leaveRoom = async () => {
    navigate('/dashboard')
  }

  return (
    <main className='editor-main'>
      <div className='top'>
        <div className='top-left'>
          <a href='/' className='company-logo'>codlin</a>
          <div className='info-display'>
            <div>
              <label><b>Room Name: </b><span id='roomName'>New-room</span></label>
              <b><FiEdit3 size={16} color={ '#777' } style={{ cursor: 'pointer' }}/></b>
            </div>
            <div>
              <label><b>Room ID: </b>{room_id}</label>
              <button 
                className='copy-btn' 
                onClick={ copyRoom }>
                Copy 
                <b><FiLink size={15} color={ '#fff' } /></b>
              </button>
            </div>
          </div>
        </div>
        <div className='top-right'>
          <button className='run-btn'>
            Run <b><FiArrowUpRight size={19} color={ '#fff' }/></b>

          </button>
        </div>
      </div>
      <div className='bottom'>
        <aside>
          <div className='member-list'>
            <h2>Members</h2>
            <hr></hr>
            {users.map((user) => (
              <User key={user.socketId} username={user.username}/>
            ))}
          </div>
          <div className='button-list'>
            <button className='leave-btn' onClick={ leaveRoom }>Leave Room</button>
          </div>
        </aside>
        <section>
            <Editor 
              socketRef={socketRef} 
              room_id={room_id} 
              onCodeChange={(code) => {codeRef.current = code;}} 
            />
        </section>
      </div>
    </main>
  )
}

export default Room