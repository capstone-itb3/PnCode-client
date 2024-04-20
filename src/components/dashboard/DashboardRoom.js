import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import RoomSelect from '../structures/RoomSelect';
import { FiPlus } from 'react-icons/fi';

function DashboardRoom({auth}) {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState(() => {
        return auth.rooms;
    });
    const [room_id, setRoomId] = useState(); 

    const createRoom = () => {
        const new_id = uuid();
        toast.success('Creating a new Room...');
        navigate(`/room/${new_id}`);
    };

    const joinRoom = (id) => {
        const joining_id = id || room_id;
    
        if (!joining_id) {
            toast.error('One of the textfields are empty.');
            return;
        } 
        navigate(`/room/${joining_id}`);    
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
                    <tr className='list-head'>
                        <th id='th-1'>Members</th>
                        <th id='th-2'>Name</th>
                        <th id='th-3'>Owner</th>
                        <th id='th-4'>Team</th>
                        <th id='th-5'>Date Updated</th>
                    </tr>
                    {rooms.map((room) => (
                        <RoomSelect key={room}  room={room} />
                    ))}
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