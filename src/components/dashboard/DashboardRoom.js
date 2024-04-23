import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import RoomSelect from '../structures/RoomSelect';
import { FiPlus } from 'react-icons/fi';

function DashboardRoom({auth}) {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState(() => {
        return auth.rooms;
    });
    const [room_id, setRoomId] = useState(); 

    async function createRoom () {
        toast.success('Redirecting you to a new Room...');

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: auth.username
            })
        });
        const data = await response.json();

        if (data.status === 'ok') {
            Cookies.set('token', data.user);
            navigate(`/room/${data.room_id}`);
        } else {
            console.log(data.error);
        }
    };

    const joinRoom = (id) => {
        const joining_id = id || room_id;
    
        if (!joining_id) {
            toast.error('Please fill out the textfield.');
        } else {
            async function fetchData() {
                const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/verify-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        room_id: joining_id
                    })
                });
                const data = await response.json();
          
                if (data.room_id) {
                    toast.success(`Joining Room: ${data.room_id}`);
                    navigate(`/room/${joining_id}`);                    
                } else {
                    toast.error('This Room ID does not exist.');
                }
            }
            fetchData(); 
        }

      };
    
    const quickEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom(); 
        }
    }
    
    let list = '';

    if (auth.rooms.length === 0) {
        list =  <div className='no-results'>
                    No rooms found. <span onClick={ createRoom }>Create one.</span>
                </div>;
    } else {
        list =  <table>
                    <thead><tr className='list-head'>
                        <th id='th-1'>Members</th>
                        <th id='th-2'>Room Name</th>
                        <th id='th-3'>Owner</th>
                        <th id='th-4'>Team</th>
                        <th id='th-5'>Date Updated</th>
                    </tr></thead>
                    <tbody>
                        {rooms.map((room) => (
                            <RoomSelect key={room}  room={room} />
                        ))}
                    </tbody>
                </table>
    }

    return (
        <section className='dashroom-section'>
            <label className='section-title'>
                <b>Rooms</b> <span>({auth.rooms.length})</span>
            </label>
            <div className='start-options'>
                <button 
                    onClick={ createRoom } 
                    className='create-btn'
                >
                    Create <FiPlus size={'15px'}/>
                </button>
                <label>OR</label>
                <input 
                    type='text' 
                    className='join-text' 
                    placeholder='Enter an existing Room ID' 
                    value={room_id} 
                    onChange={(e) => setRoomId(e.target.value)} 
                    onKeyUp={quickEnter}
                />
                <button 
                    onClick={() => joinRoom(room_id) } 
                    className='join-btn'
                >
                    Join Room
                </button>
            </div>
            <div className='room-list'>
                {list}
            </div>
        </section>
    )
}

export default DashboardRoom