import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function JoinRoom() {
  const [room_id, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate =  useNavigate();

  const createRoom = (e) => {
    e.preventDefault();
    const new_id = uuid();
    setRoomId(new_id);
    toast.success('Loading a new Room...');

//  room_id = e => setRoomId(e.target.value);
  };

  const joinRoom = () => {
    if (!room_id || !username) {
      toast.error('Please input a Room Id in the textfield.');
      return;
    } 
    navigate( `/editor/${room_id}`, {
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
      <input type='text' className='room-text' placeholder='Enter username' value={username} onChange={(e) => setUsername(e.target.value)} onKeyUp={quickEnter} ></input>

      <button className='submit' onClick={ joinRoom } >
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