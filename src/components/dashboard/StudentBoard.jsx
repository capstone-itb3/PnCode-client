import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import RoomSelect from './RoomSelect';
import { FiPlus } from 'react-icons/fi';
import { Student } from '../../classes/UserClass';


function StudentBoard({auth}) {
    const navigate = useNavigate();
    const [solo_rooms, setSoloList] = useState(<div>Retrieving...</div>);
    const [assigned_rooms, setAssignedList] = useState(<div>Retrieving...</div>);
    const [student, setStudent] = useState(() => {
        const student_id = auth.student_id;
        const first_name = auth.first_name;
        const last_name = auth.last_name;
        const year = auth.year;
        const section = auth.section;
        const position = auth.position;
        const solo_rooms = auth.solo_rooms;
        const assigned_rooms = auth.assigned_rooms;
        const teams = auth.teams;

        return new Student(student_id, first_name, last_name, year, section, position, solo_rooms, assigned_rooms, teams);
    });
    

    useEffect(() => {
        console.log(student);
        async function init() {
            const rooms = await student.getAllRooms();
            
            displaySoloRooms(rooms.solo_rooms);
            displayAssignedRooms(rooms.assigned_rooms);    
        }
        init();
    }, []);
    
    function displaySoloRooms(rooms) {
        if (rooms.length === 0) {
            setSoloList( <div className='no-results'>
                             No room is created yet.
                         </div> 
            );
        } else {
            setSoloList( <table className='solo-table'>
                            <tbody>
                                <tr className='list-head'>
                                    <th className='col-1'>#</th>
                                    <th className='col-2'>Room Name</th>
                                    <th className='col-3'>Date Updated</th>
                                </tr>
                                {rooms.map((room, index) => (
                                    <RoomSelect key={room.room_id} type={'solo'} room={room} index={index} />
                                ))}
                                
                            </tbody>
                        </table> 
            );
        }
    }
    
    function displayAssignedRooms(rooms) {
        if (rooms.length === 0) {
            setAssignedList( <div className='no-results'>
                             No room is assigned yet.
                         </div> 
            );
        } else {
            setAssignedList( <table className='assigned-table'>
                                <tbody>
                                    <tr className='list-head'>
                                        <th className='col-1'>#</th>
                                        <th className='col-2'>Room Name</th>
                                        <th className='col-3'>Members</th>
                                        <th className='col-4'>Assigned</th>
                                        <th className='col-5'>Professor</th>
                                        <th className='col-6'>Date Updated</th>
                                    </tr>
                                    {rooms.map((room, index) => (
                                        <RoomSelect key={room.room_id} type={'assigned'} room={room} index={index} />
                                    ))}
                                    
                                </tbody>
                            </table> 
            );
        }
    }

    function createSoloRoom() {
        student.createSoloRoom();
    }
    function createTeam() {
        student.createTeam();
    }

    return (
        <section className='dash-section'>
            <div className='separator ' id='show-teams'>
                <div className='section-title'>
                    <label>Teams</label> <span>({student.teams.length})</span>
                </div>
                <div>
                    <button className='create-btn' onClick={ createTeam }>Create Team</button>
                </div>
            </div>
            <div className='separator ' id='show-assigned'>
                <div className='section-title'>
                    <label>Assigned Rooms</label> <span>({student.assigned_rooms.length})</span>
                </div>
                <div className='room-list'>
                    {assigned_rooms}
                </div>
            </div>
            <div className='separator ' id='show-solo'>
                <div className='section-title'>
                    <label>Solo Rooms</label> <span>({student.solo_rooms.length})</span>
                </div>
                <div className='room-list'>
                    {solo_rooms}
                    <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>
                </div>
            </div>
        </section>
    )
}

export default StudentBoard

//     return (
//         <section className='dashroom-section'>
//             <div className='separator '>
//                 <label className='section-title'>
//                     <b>Teams</b> <span>({student.teams.length})</span>
//                 </label>
//             </div>
//             <div className='separator '>
//                 <label className='section-title'>
//                     <b>Assigned Rooms</b> <span>({student.assigned_rooms.length})</span>
//                 </label>
//                 <div className='room-list'>
//                     { rooms ? <ListGrouped rooms={rooms.assigned_rooms} /> : null}
//                 </div>
//             </div>
//             <div className='separator '>
//                 <label className='section-title'>
//                     <b>Solo Rooms</b> <span>({student.solo_rooms.length})</span>
//                 </label>
//                 <div className='room-list'>
//                     { rooms ? <ListSolo rooms={rooms.solo_rooms} /> : null}
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default StudentBoard