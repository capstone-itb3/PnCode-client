import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function RoomSelect({ room }) {
  const [display, setDisplay] = useState(() => {
    const date = new Date(room.updatedAt);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes();
    const period = date.getHours() < 12 ? 'AM' : 'PM';

    room.updatedAt = `${day < 10 ? '0' + day : day}, ${month} ${year} ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    return room;
  });
  const navigate = useNavigate();
  

  return (
    <tr className='list-item' onClick={() => { navigate(`/room/${display.room_id}`) }}>
      <td className='item-1'><FiUsers size={22}/> {display.joined.length + 1}</td>
      <td>{display.room_name}</td>
      <td>{display.owner}</td>
      <td>{display.team || 'No Team'}</td>
      <td>{display.updatedAt}</td>
    </tr>
  );
}

export default RoomSelect;