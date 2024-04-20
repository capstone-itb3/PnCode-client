import React, { useEffect, useRef, useState } from 'react';
import User from './structures/User';
import Editor from './structures/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Do, Err, Is } from '../commands';
import { FiLink } from 'react-icons/fi';

function Room() {   
  const [ users, setUser ] = useState ([]); 

  const codeRef = useRef(null);  
  const socketRef = useRef(null);
  
  const location = useLocation(); 
  const navigate = useNavigate();
  const { room_id } = useParams();
  document.getElementsByTagName('title').innerHTML = room_id;

  useEffect (() =>  {
    const init = async () => {
       socketRef.current = await initSocket();
       socketRef.current.on(Err.CONNECTERROR, (err) => handleError(err));
       socketRef.current.on(Err.CONNECTFAILED, (err) => handleError(err));

      const handleError = (e) => {
        console.log('Error: ', e);
        toast.error('Error. Socket connection failed.');
        navigate('/join-room');
      }

      socketRef.current.emit(Do.JOIN, {
        room_id,
        username: location.state?.username, 
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

  if (!location.state?.username) {
    return navigate('/');
  }

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
    navigate('/join-room')
  }

  return (
    <main className='editor-main'>
      <div className='top'>
        <label><b>Room ID:</b> {room_id}</label>
        <button 
          className='room-btn' 
          style={{ backgroundColor: '#00ff00' }} 
          onClick={ copyRoom }>
          Copy <b><FiLink size={16} color={ '#fff' } /></b>
        </button>
      </div>
      <hr></hr>
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
            <button className='room-btn' style={{ backgroundColor: '#ff0000' }} onClick={ leaveRoom }>Leave Room</button>
          </div>
        </aside>
        <section>
            <Editor socketRef={socketRef} room_id={room_id} onCodeChange={(code) => {codeRef.current = code;}} />
        </section>
      </div>
    </main>
  )
}

export default Room