import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ImArrowUpRight2 } from 'react-icons/im';
import Cookies from 'js-cookie';
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'
import { getToken, getClass } from '../validator';
import UserAvatar from '../UserAvatar';
import Options from './Options';

function SoloRoom() {
  const [auth, getAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser] = useState(getClass(auth, auth.position));
  const { room_id } = useParams();
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_APP_BACKEND_URL);
    setSocket(newSocket);
  
    newSocket.emit('join_room', room_id);
  
    return () => newSocket.close();
  }, [room_id]);
  
  useEffect(() => {
    if (!socket) return;
  
    async function initRoom() {
      const new_room = await user.getSoloRoomDetails(room_id);
      setRoom(new_room);
  
      const state = EditorState.create({
        doc: new_room.code,
        extensions: [
          basicSetup,
          html(),
          oneDark,
          EditorView.updateListener.of((e) => {
            socket.emit('code_change', {room_id: room_id, code: e.state.doc.toString()});
          })
        ]
      });
      const view = new EditorView({ state, parent: document.querySelector('#editor-div') });
  
      socket.on('code_update', (new_code) => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: new_code }
        });
      });
      return () => view.destroy();
    }
  
    initRoom();
  }, [socket, room_id]);
  
  function disableCopyPaste() {
    document.onkeydown = disableSelectCopy;
    document.addEventListener('contextmenu', event => event.preventDefault());

    function disableSelectCopy(e) {
      var pressedKey = String.fromCharCode(e.keyCode).toLowerCase();
      if ((e.ctrlKey && (pressedKey === "c" || pressedKey === "x" || pressedKey === "v" || pressedKey === "a" || pressedKey === "u")) ||  e.keyCode === 123) {
          return false;
      }
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
    showtrigger++;
  }

  const fullView = () => {
  }

  function setTheme () {
    
  }

  return (
    <main className='room-main'>
      <Options type='solo' room={room} user={user} setTheme={setTheme}/>        
      <aside id='side-lists'>
        <div className='member-list'>
          <h5>Members</h5>
          <div className='flex-column'>
            <section className='items-center user-section'>
              <UserAvatar name={`${user.last_name}, ${user.first_name.charAt(0)}.`} size={22}/>
              <span> { `${user.last_name}, ${user.first_name.charAt(0)}.` }</span>
            </section>
          </div>
        </div>
      </aside>
        <section id='editor-section'>
          <div id='output-div'>
            <div className='output-header'>
              <label>Output</label>
              <div className='items-center'>
                <button className='output-btn items-center' id='hide-btn' onClick={ hideView } >—</button>
                <button className='output-btn items-center' id='full-btn' onClick={ fullView } >
                  <ImArrowUpRight2 color={'#505050'}size={17}/>
                </button>
              </div>
            </div>
            <iframe title= 'Displays Output' id='output-iframe' /**onKeyUp={ escapeFullView }*/>
            </iframe>
          </div>
          <div id='editor-div'>
          </div>
        </section>
        {/* <button className='hide-btn'>
          <FiArrowLeft size={19} color={ '#fff' }/>
        </button> */}
    </main>
  )
}

export default SoloRoom