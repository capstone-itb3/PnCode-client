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
import { getClass } from '../validator'

function BoardProfessor({ auth, checkParams }) {
    const [professor, setProfessor] = useState(getClass(auth, 'Professor'));
    const { course, section } = useParams();
    const [course_info, setCourseInfo] = useState({ 
        course_code: course,
        course_title: null,
        section: null,
        professor: null
    });
    
    const [list_teams, setListTeams] = useState([]);
    const [list_activities, setListActivities] = useState([]);
    const [list_solo, setListSolo] = useState([]);
    const [loading_teams, setLoadingTeams] = useState(true);
    const [loading_activities, setLoadingActivities] = useState(true);
    const [loading_solo, setLoadingSolo] = useState(true);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [team_count, setTeamCount] = useState(0);
    const [activity_count, setActivityCount] = useState(0);
    const [solo_count, setSoloCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(professor);
        async function init() {
            const rooms = await professor.getSoloRooms();
            
            setListSolo(rooms);
            setLoadingSolo(false);
            setSoloCount(rooms.length);
        }
        init();
    }, []);

    useEffect(() => {
        setLoadingTeams(true);
        setLoadingActivities(true);

        async function init() {
            const info = professor.assigned_courses.find((val) => val.course_code === course);

            if (info) {
                setCourseInfo({
                    course_code: info.course_code,
                    course_title: info.course_title,
                })
        
                displayTeams(await professor.getTeams(course, section));
                displayActivities(await professor.getActivities(course, section));    
            }
        }
        init();
    }, [course, section]);
        
    function displayTeams (teams = []) {
        setListTeams(teams);
        setLoadingTeams(false); 
        setTeamCount(teams.length);
    }
    
    function displayActivities(activities = []) {
        setListActivities(activities);
        setLoadingActivities(false); 
        setActivityCount(activities.length);
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
                {professor && <TabCourse user={professor}/>}
                <div className='display-content flex-column'>
                {course_info.course_title &&
                    <div id='course-info' className='flex-column'>
                        <label className='full-title'>{course_info.course_code} {course_info.course_title}</label>
                        <label className='sub-title'>Section: {section}</label>
                    </div>}
                    <div className='content-header' id='show-solo-rooms'>
                        <label className='title-course'></label>
                        <label className='course-title'></label>  
                    </div>
                    <div className='separator' id='show-teams'>
                        <div className='section-title'>
                            <label>Teams <span>({team_count})</span> </label>
                        </div>
                        {loading_teams 
                            ? <div className='in-retrieve'>Retrieving...</div>
                            : <TeamBoard uid={professor.uid} teams={list_teams} openTeamPopup={openTeamPopup}/>
                        }
                    </div>
                    <div className='separator' id='show-activities'>
                        <div className='section-title'>
                            <label>Group Activities <span>({activity_count})</span></label>
                        </div>
                        {loading_activities
                            ? <div className='in-retrieve'>Retrieving...</div> 
                            : <ActivityBoard activities={list_activities} professor={professor} course={course}/>
                        }
                        {!loading_activities &&
                            <button className='create-btn' onClick={openActivityPopup}>Create Activity</button>
                        }
                    </div>
                    <div className='separator ' id='show-solo'>
                        <div className='section-title'>
                            <label>Solo Rooms <span>({solo_count})</span></label>
                        </div>
                        {loading_solo
                            ? <div className='in-retrieve'>Retrieving...</div>
                            : <SoloRoomBoard rooms={list_solo}/>
                        }
                        {!loading_solo && 
                            <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>}
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

function TeamBoard({uid,  teams, openTeamPopup }) {

    return (
        <div id='team-selection' className='flex-row'>
            <button className='team-plus' onClick={openTeamPopup}>+</button>
            {teams.map((team) => (
                <SelectTeam 
                    key={team.team_id} 
                    uid={uid} 
                    team={team} 
                />
            ))}
        </div>
    )
}

function ActivityBoard({activities}) {
    function goToActivity(activity_id) {
        window.location.href = `/activity/${activity_id}`;
    }

    if (activities.length === 0) {
        return ( <div className='no-results'>
                    You have no activity for the students to do yet.
                </div> 
        );
    } else {
        return (<div id='activity-selection' className='flex-column'>
                    {activities.map((activity, index) => (
                        <SelectActivity 
                            key={activity.activity_id}  
                            onClick={() => goToActivity(activity.activity_id)} 
                            activity={activity} 
                            index={index} />
                    ))}
                </div>
        )
    }
}

function SoloRoomBoard({rooms}) {
    if (rooms.length === 0) {
        return ( <div className='no-results'>
                    No room is created yet.
                </div> 
        );
    } else {
        return ( <table className='solo-table'>
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