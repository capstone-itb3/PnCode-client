import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import Sidebar from './Sidebar';
import TabCourse from './TabCourse';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import CreateActivity from './CreateActivity';
import { Professor } from '../../classes/UserClass';

function BoardProfessor({ auth, checkParams }) {
    const [professor, setProfessor] = useState(() => {
        return new Professor(
            auth.uid, 
            auth.email, 
            auth.first_name, 
            auth.last_name, 
            auth.position, 
            auth.notifications,
            auth.preferences,
            auth.assigned_courses, 
        );
        
    });
    const [display_teams, setDisplayTeams] = useState(<div className='in-retrieve'>Retrieving...</div>);
    const [display_activities, setDisplayActivities] = useState(<div className='in-retrieve'>Retrieving...</div>);
    const [display_solo, setDisplaySolo] = useState(<div className='in-retrieve'>Retrieving...</div>);
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
        setDisplayTeams(<div className='in-retrieve'>Retrieving...</div>);
        setDisplayActivities(<div className='in-retrieve'>Retrieving...</div>);

        async function init() {
            displayTeams(await professor.getTeams(course, section));
            displayActivities(await professor.getActivities(course, section));
        }
        init();
    }, [course, section]);
        
    function displayTeams(teams = []) {
        setDisplayTeams(<div id='team-selection' className='flex-row'>
                            <button className='team-plus' onClick={openTeamPopup}>+</button>
                            {teams.map((team) => (
                                <SelectTeam key={team.team_id} team={team} />
                            ))}
                        </div>
        )
    }

    function displayActivities(activities = []) {
        setDisplayActivities(<div id='activity-selection' className='flex-column'>
                                {activities.map((activity, index) => (
                                    <SelectActivity key={activity.activity_id} activity={activity} index={index} />
                                ))}
                             </div>
        );
    }

    function displaySoloRooms(rooms = []) {
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
                                        <SelectRoom key={room.room_id} type={'solo'} room={room} index={index} />
                                    ))}             
                                </tbody>
                            </table> 
            );
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
    
    function showSidebar () {
        document.getElementById('sidebar-main').style.left = 0;
    }

    return (
        <main id='dashboard-main'>
            <Sidebar checkParams={checkParams} position={auth.position}/>
            <section className='dash-section flex-column'>
                <button id='dash-burger' onClick={ showSidebar }><BsListUl size={ 30 }/></button>
                <TabCourse user={professor}/>
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
                        </div>
                    </div>
                    <div className='separator' id='show-activities'>
                        <div className='section-title'>
                            <label>Group Activities</label>
                        </div>
                        <div>
                            {display_activities}
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
                {
                    isActivityModalOpen && 
                    ( <CreateActivity
                        user={professor} 
                        course={course}
                        section={section}
                        exit={() => {setIsActivityModalOpen(false)}} /> )
                }
            </section>
        </main>
    )
}

export default BoardProfessor

//                 <div className='room-list'>
//                     { rooms ? <ListGrouped rooms={rooms.assigned_rooms} /> : null}
//                 </div>
// 
//                 <div className='room-list'>
//                     { rooms ? <ListSolo rooms={rooms.solo_rooms} /> : null}
//                 </div>