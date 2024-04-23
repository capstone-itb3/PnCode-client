import React, { useEffect, useRef, useState } from 'react';
import User from './structures/User';
import Editor from './structures/Editor';
import { initSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Do, Err, Is } from '../commands';
import { FiArrowLeft, FiEdit3, FiLink } from 'react-icons/fi';
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
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/verify-room', {
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
        addToJoined(room_id, auth.username);

        let roomName = document.getElementById('roomName');
        roomName.value = data.room_name
        
        if(data.owner !== auth.username) {
          roomName.setAttribute('readonly', 'readonly');
          roomName.onfocus = roomName.blur();

          document.getElementById('editIcon').style.display = 'none';
        }



      } else {
        alert('This Room ID does not exist.');
        navigate('/dashboard');
      }
    }
    fetchData();

    async function addToJoined(room_id, username) {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/add-joined', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id,
          username
        })
      })
      const data = await response.json();

      if (data.status) {
        Cookies.set('token', data.user);
      } else {
        console.error(data.error);
      }
    }
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
    navigate('/dashboard');
  }

  const editRoomName = async (value) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/rename-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room_id: room_id,
        room_name: value
      })
    });
  }

  return (
    <main className='editor-main'>
      <div className='top'>
        <div className='top-left'>
          <a href='/' className='company-logo'>codlin</a>
          <div className='info-display'>
            <div> 
              <b>Room Name: </b><input type='text' id='roomName' onKeyUp={(e) => editRoomName(e.target.value) } />
              <b id='editIcon'><FiEdit3 size={16} color={ '#555' } /></b>
            </div>
            <div>
              <b>Room ID: </b>{room_id}
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
            View in Full <b><FiArrowLeft size={19} color={ '#fff' }/></b>
          </button>
        </div>
      </div>
      <aside className='side-lists'>
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
      <section className='editor-section'>
        <iframe title= 'Displays Output' id='output-div'>
        </iframe>
        <Editor 
          socketRef={socketRef} 
          room_id={room_id} 
          onCodeChange={(code) => {codeRef.current = code;}} 
        />
      </section>
    </main>
  )
}

export default Room