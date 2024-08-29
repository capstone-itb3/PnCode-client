import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import Sidebar from './Sidebar';
import TabCourse from './TabCourse';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import { getClass } from '../validator';

function BoardStudent({auth, checkParams}) {
    const [student, setStudent ] = useState(getClass(auth, 'Student'));
    const { course } = useParams();
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
    const [team_count, setTeamCount] = useState(0);
    const [activity_count, setActivityCount] = useState(0);
    const [solo_count, setSoloCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            const rooms = await student.getSoloRooms();
            
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
            const info = student.enrolled_courses.find((val) => val.course_code === course);

            if (info) {
                setCourseInfo({
                    course_code: course,
                    course_title: info.course_title,
                    section: info.section,
                    professor: await student.getCourseProfessor(info.course_code, info.section)
                })    
            }
    
            displayTeams(await student.getTeams(course, student.section));
            displayActivities(await student.getActivities(course, student.section));
        }
        init();
    }, [course]);
    
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
        student.createSoloRoom();
    }
    
    function openTeamPopup () {
        setIsModalOpen(true);
    }

    function showSidebar () {
        document.getElementById('sidebar-main').style.left = 0;
    }

    return (
        <main id='dashboard-main'>
            <Sidebar checkParams={checkParams} position={auth.position}/>
            <section className='dash-section flex-column'>
                <button id='dash-burger' onClick={ showSidebar }><BsListUl size={ 30 }/></button>
                <TabCourse user={student}/>
                <div className='display-content flex-column'>
                    {course_info.course_title && course_info.section && course_info.professor &&
                    <div id='course-info' className='flex-column'>
                        <label className='full-title'>{course_info.course_code} {course_info.course_title}</label>
                        <label className='sub-title'>Section: {course_info.section}</label>
                        <label className='sub-title'>Professor: {course_info.professor}</label>
                    </div>}
                    <div className='separator' id='show-teams'>
                        <div className='section-title'>
                            <label>Teams <span>({team_count})</span></label>
                        </div>
                        {loading_teams 
                            ? <div className='in-retrieve'>Retrieving...</div>
                            : <TeamBoard uid={student.uid} 
                                         teams={list_teams} 
                                         openTeamPopup={openTeamPopup}/>
                        }
                    </div>
                    <div className='separator ' id='show-activities'>
                        <div className='section-title'>
                            <label>Activities <span>({activity_count})</span></label>
                        </div>
                        {loading_activities
                            ? <div className='in-retrieve'>Retrieving...</div> 
                            : <ActivityBoard activities={list_activities} 
                                             student={student} 
                                             course={course} 
                                             section={course_info.section}/>
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
                    isModalOpen && ( <CreateTeam 
                                        user={student} 
                                        course={course_info.course_code} 
                                        section={course_info.section} 
                                        teams={list_teams}
                                        exit={() => {setIsModalOpen(false)}} /> )
                }
            
            </section>
        </main>
    )
}

export default BoardStudent


function TeamBoard({uid,  teams, openTeamPopup }) {
    teams.sort((a, b) => {
        const hasTargetMemberA = a.members.some(member => member.uid === uid);
        const hasTargetMemberB = b.members.some(member => member.uid === uid);
        
        if (hasTargetMemberA && !hasTargetMemberB) return -1;
        if (!hasTargetMemberA && hasTargetMemberB) return 1;
        // If neither team has the target member, return 0 to preserve original order
        return 0;
    });

    const [showPlus, setShowPlus] = useState(() => {
        const userHasTeam = teams.some(t => t.members.some(m => m.uid === uid));
        return !userHasTeam;
    });
    
    return (
        <div id='team-selection' className='flex-row'>
            {showPlus &&
                <button className='team-plus' onClick={openTeamPopup}>+</button> 
            }
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

function ActivityBoard({activities, student, course, section}) {
    function goToAssignedRoom(activity_id) {
        student.visitActivity(activity_id, course, section);
    }

    if (activities.length === 0) {
        return ( <div className='no-results'>
                    You have no activity to do yet.
                </div> 
        );
    } else {
        return (<div id='activity-selection' className='flex-column'>
                    {activities.map((activity, index) => (
                        <SelectActivity 
                            key={activity.activity_id}  
                            onClick={() => goToAssignedRoom(activity.activity_id)} 
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