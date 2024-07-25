import React from 'react';
import RoomSelect from './RoomSelect.jsx';

function ListGrouped(rooms) {
    if (rooms.length === 0) {
        return ( <div className='no-results'> No rooms found. </div> );

    } else {
        return ( <table>
                    <tbody>
                        <tr className='list-head'>
                            <th className='th-1'>#</th>
                            <th className='th-2'>Room Name</th>
                            <th className='th-3'>Members</th>
                            <th className='th-4'>Assigned</th>
                            <th className='th-5'>Professor</th>
                            <th className='th-6'>Date Updated</th>
                        </tr>
                        {rooms.map((room, index) => (
                            <RoomSelect key={room.room_id} type={'grouped'} room={room} index={index} />
                        ))}
                        
                    </tbody>
                </table> 
        );
    }
}

export default ListGrouped