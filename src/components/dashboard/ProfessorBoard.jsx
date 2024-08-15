import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import CoursesTab from './CoursesTab';
import RoomSelect from './RoomSelect';
import TeamSelect from './TeamSelect';
import CreateTeam from './CreateTeam';
import { Professor } from '../../classes/UserClass';

function ProfessorBoard({auth, checkParams}) {
    const [professor, setProfessor] = useState(() => {
        return new Professor(
            auth.uid, 
            auth.email, 
            auth.first_name, 
            auth.last_name, 
            auth.position, 
            auth.preferences,
            auth.assigned_courses, 
        );
        
    });
    const [display_teams, setDisplayTeams] = useState(<div>Retrieving...</div>);
    const [display_groups, setDisplayGroup] = useState(<div>Retrieving...</div>);
    const [display_solo, setDisplaySolo] = useState(<div>Retrieving...</div>);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const navigate = useNavigate();
    const { course, section } = useParams();

    useEffect(() => {
        async function init() {
            displaySoloRooms(await professor.getSoloRooms());
        }
        init();
    }, []);

    useEffect(() => {
        async function init() {
            displayTeams(await professor.getTeams(course, section));
        }
        init();
    }, [course, section]);
        
    function displaySoloRooms(rooms) {
        if (rooms.length === 0) {
            setDisplaySolo( <div className='no-results'>
                                No room is created yet.
                            </div> 
            );
        } else {
            setDisplaySolo( <table className='solo-table'>
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

    function displayTeams(teams) {
        if (teams.length === 0) {
            setDisplayTeams( <div className='no-results'>
                                No team is created yet.
                            </div>
            );
        } else {
            setDisplayTeams(<div className='team-selection flex-row'>
                                {teams.map((team) => (
                                    <TeamSelect key={team.team_id} team={team} />
                                ))}
                            </div>
            );
            console.log(teams);
        }
    }
    function createSoloRoom() {
        professor.createSoloRoom();
    }

    function openTeamPopup () {
        setIsTeamModalOpen(true);
    }

    function openActivityPopup () {
        setIsActivityModalOpen(true);
    }    
    
    return (
        <main id='dashboard-main'>
            <Sidebar checkParams={checkParams} position={auth.position}/>
            <section className='dash-section flex-column'>
                <CoursesTab user={professor}/>
                <div className='display-content flex-column'>
                    <div className='content-header' id='show-solo-rooms'>
                        <label className='title-course'></label>
                        <label className='course-title'></label>
                        
                    </div>
                    <div className='separator' id='show-teams'>
                        <div className='section-title'>
                            <label>Teams</label>
                        </div>
                        <div>
                            {display_teams}
                            <button className='create-btn' onClick={openTeamPopup}>Create Team</button>
                        </div>
                    </div>
                    <div className='separator' id='show-groups'>
                        <div className='section-title'>
                            <label>Group Activities</label>
                        </div>
                        <div>
                            <button className='create-btn' onClick={openActivityPopup}>Create Activity</button>
                        </div>
                    </div>
                    <div className='separator ' id='show-solo'>
                        <div className='section-title'>
                            <label>Solo Rooms</label>
                        </div>
                        <div className='room-list'>
                            {display_solo}
                            <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>
                        </div>
                    </div>
                </div>
                {
                    isTeamModalOpen && 
                    ( <CreateTeam 
                        user={professor} 
                        course={course}
                        section={section}
                        exit={() => {setIsTeamModalOpen(false)}} /> )
                }
                {/* {
                    isTeamModalOpen && 
                    ( <CreateTeam user={professor} exit={() => {setIsTeamModalOpen(false)}} /> )
                } */}
            </section>
        </main>
    )
}

export default ProfessorBoard

//                 <div className='room-list'>
//                     { rooms ? <ListGrouped rooms={rooms.assigned_rooms} /> : null}
//                 </div>
// 
//                 <div className='room-list'>
//                     { rooms ? <ListSolo rooms={rooms.solo_rooms} /> : null}
//                 </div>