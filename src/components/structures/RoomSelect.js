import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function RoomSelect({ room }) {
  const [display, setDisplay] = useState({
    room_id: null,
    room_name: '',
    owner: '',
    joined: [],
    team: 'No Team'
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/display-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: room
        })
      });
      const data = await response.json();

      if (data.room_id) {
        setDisplay(data);
      } else {
        console.log('No rooms found or Error');
      }
    }

    fetchData();
  }, [room]);

  return (
    <tr className='list-item' onClick={() => { navigate(`/room/${display.room_id}`) }}>
      <td className='item-1'><FiUsers size={22}/> {display.joined.length + 1}</td>
      <td>{display.room_name}</td>
      <td>{display.owner}</td>
      <td>{display.team || 'No Team'}</td>
      <td></td>
    </tr>
  );
}

export default RoomSelect;