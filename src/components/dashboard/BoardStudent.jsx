import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import AddCourse from './AddCourse';
import { getClass } from '../validator';

function BoardStudent({ auth, setHeaderName }) {
    const [student, setStudent ] = useState(getClass(auth, 'Student'));
    const { course, section, select } = useParams();
    const [course_info, setCourseInfo] = useState({ 
        course_code: course,
        course_title: null,
        section: null,
        professor: null
    });
    const [course_list, setCourseList] = useState([]);
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
    const [addCourse, setAddCourse] = useState(false);
    const [noCourse, setNoCourse] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            const rooms = await student.getSoloRooms();
            const course_data = await student.getEnrolledCourses();
            
            if (course_data[0] && !course_data.some(c => c.course_code === course && c.section === section)) {
                navigate(`/dashboard/${course_data[0].course_code}/${course_data[0].section}/${select ? select : 'all'}`);
            }
            setCourseList(course_data);
            displayInformation(course_data);
          
            setListSolo(rooms);
            setLoadingSolo(false);
            setSoloCount(rooms.length);
        }
        init();
    }, []);

    useEffect(() => {
        if (course_list.length  > 0) {
            displayInformation(course_list);
        }
    }, [course, section])

    async function displayInformation(courses = []) {
        setLoadingTeams(true);
        setLoadingActivities(true);

        if (courses.length > 0) {
            const info = courses.find((c) => c?.course_code === course && c?.section === section);
            if (info) {    
                setCourseInfo({
                    course_code: course,
                    course_title: info.course_title,
                    section: info.section,
                    professor: info.professor
                })    

                displayTeams(await student.getTeams(course, section));
                displayActivities(await student.getActivities(course, section));    
                
                setHeaderName(`${course}`);
            } else {
                navigate(`/dashboard/${courses[0].course_code}/${courses[0].section}/${select ? select : 'all'}`);   
            }
        } else {
            setNoCourse(true);
            navigate('/dashboard');
        }
    };
    
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

    async function createSoloRoom() {
        const room = await student.createSoloRoom();

        if (room) {
            navigate(`/solo/${room}`);
            toast.success('New solo room has been created.');
        }
    }
    
    function openTeamPopup () {
        setIsModalOpen(true);
    }

    function showSidebar () {
        document.getElementById('sidebar-main').style.left = 0;
    }

    return (
        <main id='dashboard-main'>
                <Sidebar user={student} courses={course_list} setAddCourse={setAddCourse} />
            <section className='dash-section flex-column'>
                <button id='dash-burger' className='items-center' onClick={ showSidebar }><BsListUl size={ 30 }/></button>
                <div className='display-content flex-column'>
                    {course_info.course_title && course_info.section && course_info.professor &&
                    <div id='course-info' className='flex-column'>
                        <label className='full-title'>{course_info.course_code} {course_info.course_title}</label>
                        <label className='sub-title'>Section: {course_info.section}</label>
                        <label className='sub-title'>Professor: {course_info.professor}</label>
                    </div>
                    }
                    {course && section &&
                        <>
                            <div className={`separator ${(select === 'activities' || select === 'solo') && 'none'}`} id='show-teams'>
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
                            <div className={`separator ${(select === 'teams' || select === 'solo') && 'none'}`} id='show-teams'>
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
                        </>
                    } 
                    {noCourse &&
                        <div className='no-course'>
                            <label>No course yet? Click '+ Join Course' on the sidebar.</label>
                        </div>
                    }

                    <div className={`separator ${(select === 'activities' || select === 'teams') && 'none'}`} id='show-teams'>
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
                {
                    addCourse && ( <AddCourse 
                                    user={student}
                                    exit={() => {setAddCourse(false)}} 
                                    /> )

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
        return (<div id='activity-selection' className='flex-column items-center'>
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