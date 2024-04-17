import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function JoinRoom() {
  const [room_id, setRoomId] = useState();
  const [username, setUsername] = useState(() => {
    const auth = localStorage.getItem('token');
    if(auth !== null) {
        const user = jwtDecode(auth);
        if(!user) {
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            console.log(user.username);
            return user.username;
        }
    } else {
        navigate('/login');
    }
  });
  const navigate =  useNavigate();

  // useEffect(() => {
  // }, []);


  const createRoom = (e) => {
    e.preventDefault();
    const new_id = uuid();
    setRoomId(new_id);
    toast.success('Loading a new Room...');

    joinRoom(new_id);
  };

  const joinRoom = (id) => {
    const joining_id = id || room_id;

    if (!joining_id) {
      toast.error('One of the textfields are empty.');
      return;
    } 
    navigate( `/room/${joining_id}`, {
      state: { username }
    });
  };

  const quickEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom(); 
    }
  }

  return (
    <main className='join-main'>
      <h1>Join Room</h1>
      <input type='text' className='room-text' placeholder='Enter room id' value={room_id} onChange={(e) => setRoomId(e.target.value)} onKeyUp={quickEnter} ></input>

      <button className='submit' onClick={ () => joinRoom(room_id) } >
        Join Room
      </button>
      <p className='room-footer'> Want to create a new room instead?
        <span className='generator-text' onClick={ createRoom }>
          Click here.
      </span> </p>
    </main> 
  )
}

export default JoinRoom