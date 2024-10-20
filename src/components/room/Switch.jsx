import React, { useState, useEffect } from 'react'
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Switch({ room, activity }) {
    const [room_links, setRoomLinks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(activity.other_rooms);
        setRoomLinks(activity.other_rooms);
    }, [room, activity]);

    function switchRoom(room_id) {
        navigate(`/room/${room_id}`);
    }

    function arrowSwitch(arrow) {
        const currentIndex = room_links.findIndex(r => r.room_id === room.room_id);
        let newIndex;
    
        if (arrow === 'left') {
            newIndex = (currentIndex - 1 + room_links.length) % room_links.length;
        } else if (arrow === 'right') {
            newIndex = (currentIndex + 1) % room_links.length;
        }
    
        const newRoomId = room_links[newIndex].room_id;
        switchRoom(newRoomId);
    }
    
  return (
    <div id='switch-rooms' className='flex-row items-center'>
        <button className='items-center' onClick={() => arrowSwitch('left')}>
            <BsCaretLeftFill size={20}/>
        </button>
        <select id='room-select' value={room.room_id} onChange={(e) => switchRoom(e.target.value)}>
            {room_links.map((room_link) => {
                return (
                    <option 
                        key={room_link.room_id}
                        value={room_link.room_id}>
                        {room_link.room_name}
                    </option>
                )
            })}
        </select>
        <button className='items-center' onClick={() => arrowSwitch('right')}>
            <BsCaretRightFill size={20}/>
        </button>
    </div>
  )
}

export default Switch