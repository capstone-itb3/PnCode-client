import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CoursesTab from './CoursesTab';
import RoomSelect from './RoomSelect';
import CreateTeam from './CreateTeam';
import { Student } from '../../classes/UserClass';

function StudentBoard({auth, checkParams}) {
    const [solo_list, setSoloList] = useState(<div>Retrieving...</div>);
    const [assigned_list, setAssignedList] = useState(<div>Retrieving...</div>);
    const [student, setStudent] = useState(() => {
        return new Student(
            auth.uid, 
            auth.email, 
            auth.first_name, 
            auth.last_name, 
            auth.position, 
            auth.preferences,
            auth.section, 
            auth.enrolled_courses, 
        );
        
    });
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        console.log(student);
        async function init() {
            displaySoloRooms(await student.getSoloRooms());
            displayAssignedRooms(await student.getAssignedRooms());    
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
                                        <th className='col-5'>Course</th>
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
    
    // function createSoloRoom() {
    //     student.createSoloRoom();
    // }

    function openTeamPopup () {
        setIsModalOpen(true);
    }
    return (
        <main id='dashboard-main'>
            <Sidebar checkParams={checkParams} position={auth.position}/>
            <section className='dash-section flex-column'>
                <CoursesTab user={student}/>
                <div className='display-content flex-column'>
                    <div className='separator' id='show-teams'>
                        <div className='section-title'>
                            <label>Teams</label>
                        </div>
                        <div>
                            <button className='create-btn' onClick={openTeamPopup}>Create Team</button>
                        </div>
                    </div>
                    <div className='separator ' id='show-assigned'>
                        <div className='section-title'>
                            <label>Assigned Rooms</label>
                        </div>
                        <div className='room-list'>
                            {assigned_list}
                        </div>
                    </div>
                    <div className='separator ' id='show-solo'>
                        <div className='section-title'>
                            <label>Solo Rooms</label>
                        </div>
                        <div className='room-list'>
                            {solo_list}
                            <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>
                        </div>
                    </div>
                </div>                
                {
                    isModalOpen && ( <CreateTeam student={student} exit={() => {setIsModalOpen(false)}} /> )
                }
            
            </section>
        </main>
    )
}

export default StudentBoard

//                 <div className='room-list'>
//                     { rooms ? <ListGrouped rooms={rooms.assigned_rooms} /> : null}
//                 </div>
// 
//                 <div className='room-list'>
//                     { rooms ? <ListSolo rooms={rooms.solo_rooms} /> : null}
//                 </div>