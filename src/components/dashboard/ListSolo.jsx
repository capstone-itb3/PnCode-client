import React from 'react';
import RoomSelect from './RoomSelect.jsx';

function ListSolo(rooms) {
    if (rooms.length === 0) {
        return ( <div className='no-results'> No rooms found. </div> );

    } else {
        return ( <table>
                    <tbody>
                        <tr className='list-head'>
                            <th className='th-1'>#</th>
                            <th className='th-2'>Room Name</th>
                            <th className='th-3'>Date Updated</th>
                        </tr>
                        {rooms.map((room, index) => (
                            <RoomSelect key={room.room_id} type={'solo'} room={room} index={index} />
                        ))}
                        
                    </tbody>
                </table> 
        );
    }
}

export default ListSolo