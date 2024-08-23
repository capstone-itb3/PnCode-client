import React, { useState, useEffect } from 'react';

function SelectRoom({ room, index, type }) {
  const [display, setDisplay] = useState(() => {
    const date = new Date(room.updatedAt);

    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.toLocaleString('default', { month: 'long' }).slice(0, 3);
    const year = date.getFullYear();
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    room.updatedAt = `${day} ${month} ${year} ${hours}:${minutes}`;
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

export default SelectRoom;