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
  const [ userlist, setUserList ] = useState ([]);
  const [ room_info, setRoomInfo ] = useState();
  const [ socket_id, setSocketId ] = useState(null);

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
      const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/verify-room', {
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
        roomName.value = data.room_name;
        
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
      const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/add-joined', {
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

//   useEffect(() => {
// //    document.onmousedown = dMDown;
// //    function dMDown(e) { return false; }
// //    function dOClick() { return true; }
//     document.onkeydown = disableSelectCopy;
//     document.addEventListener('contextmenu', event => event.preventDefault());

//     function disableSelectCopy(e) {
//         // current pressed key
//         var pressedKey = String.fromCharCode(e.keyCode).toLowerCase();
//         if ((e.ctrlKey && (pressedKey === "c" || pressedKey === "x" || pressedKey === "v" || pressedKey === "a" || pressedKey === "u")) ||  e.keyCode === 123) {
//             return false;
//         }
//     }

//     document.addEventListener('keyup', escapeFullView);
//   }, []);

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
        setUserList(users);
        setSocketId(socketId);
      });

      socketRef.current.on(Is.DISCONNECTED, ({ socketId, username }) => {
        setUserList((prev) => {
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

  const leaveRoom = () => {
    window.location.href = '/dashboard';
  }

  const editRoomName = async (value) => {
    const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/rename-room', {
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

  const fullView = () => {
    toast.success('Press [Esc] to exit full view.');

    let top = document.getElementById('top');
    let side = document.getElementById('side-lists');
    let main = document.getElementById('editor-section');
    let editor = document.getElementById('editor-div');
    let output = document.getElementById('output-div');
    let hide = document.getElementById('hide-btn');

    top.style.top = '-63px';
    side.style.left = '-212px';
    main.style.top = '0';
    main.style.left = '0px';
    editor.style.width = 0;
    output.style.width = '100%';
    hide.style.opacity = 0;

    let doc = document.getElementById("output-div").contentWindow.document;
    doc.designMode = "on";

    if(doc.addEventListener) {// if support addEventListener
        doc.addEventListener("keyup", escapeFullView, true)
    } else { //For IE
      doc.attachEvent("onkeyup", escapeFullView);
    }
  }

  let showtrigger = 0;
  const hideView = () => {
    let editor = document.getElementById('editor-div');
    let output = document.getElementById('output-div');

    if(showtrigger % 2 === 0) {
      editor.style.width = '100%';
      output.style.width = 0;  
    } else {
      editor.style.width = '50%';
      output.style.width = '50%';  
    }
    showtrigger++ ;
  }

  const escapeFullView = (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      let top = document.getElementById('top');
      let side = document.getElementById('side-lists');
      let main = document.getElementById('editor-section');
      let editor = document.getElementById('editor-div');
      let output = document.getElementById('output-div');
      let hide =  document.getElementById('hide-btn');

      top.style.top = 0;
      side.style.left = 0;
      main.style.top = '62px';
      main.style.left = '212px';
      editor.style.width = '50%';
      output.style.width = '50%';
      hide.style.opacity = 1;

    }
  }

  return (
    <main className='editor-main' onKeyUp={ escapeFullView }>
      <div id='top' onKeyUp={ escapeFullView }>
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
          <button className='run-btn' onClick={ fullView }>
            View in Full <b><FiArrowLeft size={19} color={ '#fff' }/></b>
          </button>
        </div>
      </div>
      <aside id='side-lists'>
        <div className='member-list'>
          <h4>Members</h4>
          {userlist.map((user) => (
            <User key={user.socketId} username={user.username}/>
          ))}
        </div>
        <div className='button-list'>
          <button className='leave-btn' onClick={ leaveRoom } onKeyUp={ escapeFullView }>Leave Room</button>
        </div>
      </aside>
        <Editor 
          room_id={room_id} 
          username={auth.username} 
          code={room_info ? room_info.code : ''}
          socketRef={socketRef}
          socketId={socket_id}
        />
        <button className='hide-btn' id='hide-btn' onClick={ hideView } >
            _
        </button>
    </main>
  )
}

export default Room