import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import Sidebar from './Sidebar';
import TabCourse from './TabCourse';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import { Student } from '../../classes/UserClass';

function BoardStudent({auth, checkParams}) {
    const [display_teams, setDisplayTeams] = useState(<div className='in-retrieve'>Retrieving...</div>);
    const [display_activities, setDisplayActivities] = useState(<div className='in-retrieve'>Retrieving...</div>);
    const [display_solo, setDisplaySolo] = useState(<div className='in-retrieve'>Retrieving...</div>);
    const [team_count, setTeamCount] = useState(0);
    const [activity_count, setActivityCount] = useState(0);
    const [solo_count, setSoloCount] = useState(0);
    const [student, setStudent] = useState(() => {
        return new Student(
            auth.uid, 
            auth.email, 
            auth.first_name, 
            auth.last_name, 
            auth.position, 
            auth.notifications,
            auth.preferences,
            auth.section,   
            auth.enrolled_courses, 
        ); 
    });
    const { course } = useParams();
    const [course_info, setCourseInfo] = useState({ 
        course_code: course,
        course_title: null,
        section: null,
        professor: null
    });

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function init() {
            displaySoloRooms(await student.getSoloRooms());
        }
        init();
    }, []);

    useEffect(() => {
        setDisplayTeams(<div className='in-retrieve'>Retrieving...</div>);
        setDisplayActivities(<div className='in-retrieve'>Retrieving...</div>);

        async function init() {
            const info = student.enrolled_courses.find((val) => val.course_code === course);

            setCourseInfo({
                course_code: course,
                course_title: info.course_title,
                section: info.section,
                professor: await student.getCourseProfessor(info.course_code, info.section)
            })
    
            displayTeams(await student.getTeams(course, student.section));
            displayActivities(await student.getActivities(course, student.section));
        }
        init();
    }, [course]);
    
    function displayTeams (teams = []) {
        setDisplayTeams(<div id='team-selection' className='flex-row'>
                            <button className='team-plus' onClick={openTeamPopup}>+</button>
                            {teams.map((team) => (
                                <SelectTeam key={team.team_id} uid={student.uid} team={team} />
                            ))}
                        </div>
        )
        setTeamCount(teams.length);
    }

    function displayActivities(activities = []) {
        if (activities.length === 0) {
            setDisplayActivities( <div className='no-results'>
                                You have no activity to do yet.
                            </div> 
            );
        } else {
            setDisplayActivities(<div id='activity-selection' className='flex-column'>
                                    {activities.map((activity, index) => (
                                        <SelectActivity 
                                            key={activity.activity_id}  
                                            onClick={() => goToAssignedRoom(activity.activity_id, course)} 
                                            activity={activity} 
                                            index={index} />
                                    ))}
                                </div>
            )
        }
        setActivityCount(activities.length);
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
        setSoloCount(rooms.length);
    }
    

    function goToAssignedRoom(activity_id, course) {
        student.visitActivity(activity_id, course);
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
                        {display_teams}
                    </div>
                    <div className='separator ' id='show-activities'>
                        <div className='section-title'>
                            <label>Activities <span>({activity_count})</span></label>
                        </div>
                        {display_activities}
                    </div>
                    <div className='separator ' id='show-solo'>
                        <div className='section-title'>
                            <label>Solo Rooms <span>({solo_count})</span></label>
                        </div>
                        <div className='room-list'>
                            {display_solo}
                            <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>
                        </div>
                    </div>
                </div>                
                {
                    isModalOpen && ( <CreateTeam 
                                        user={student} 
                                        course={course_info.course_code} 
                                        section={course_info.section} 
                                        exit={() => {setIsModalOpen(false)}} /> )
                }
            
            </section>
        </main>
    )
}

export default BoardStudent
