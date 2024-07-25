import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';

function RoomSelect({ room, index, type }) {
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
  
  if (type === 'solo') {
    return (
      <tr className='list-item' onClick={() => { window.location.href = `/solo/${display.room_id}` }}>
        <td className='td-1'>{index + 1}</td>
        <td className='td-2'>{display.room_name}</td>
        <td className='td-3'>{display.updatedAt}</td>
      </tr>
    );

  //TODO grouped sorting
  // } else if (type === 'grouped') {
  //   return (
  //     <tr className='list-item' onClick={() => { window.location.href = `/room/${display.room_id}` }}>
  //       <td className='td-1'>{index}</td>
  //       <td className='td-2'>{display.room_name}</td>
  //       <td className='td-3'>{display.updatedAt}</td>
  //     </tr>
  //   );
  // }
  } else {
    return null;
  }
}

export default RoomSelect;