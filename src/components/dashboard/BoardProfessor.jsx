import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import CreateActivity from './CreateActivity';
import StudentList from './StudentList';
import { getClass } from '../validator'

function BoardProfessor({ auth, setHeaderName }) {
    const [professor, setProfessor] = useState(getClass(auth, 'Professor'));

    const { class_id, select } = useParams();
    const [class_info, setClassInfo] = useState(null);
    const [class_list, setClassList] = useState([]);
    const [showStudents, setShowStudents] = useState(false);
    
    const [list_teams, setListTeams] = useState([]);
    const [list_activities, setListActivities] = useState([]);
    const [list_solo, setListSolo] = useState([]);
    const [loading_teams, setLoadingTeams] = useState(true);
    const [loading_activities, setLoadingActivities] = useState(true);
    const [loading_solo, setLoadingSolo] = useState(true);
    const [team_count, setTeamCount] = useState(0);
    const [activity_count, setActivityCount] = useState(0);
    const [solo_count, setSoloCount] = useState(0);

    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [noCourse, setNoCourse] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            const rooms = await professor.getSoloRooms();
            const classes = await professor.getAssignedClasses();
            
            if (classes.length > 0 && !classes.some(c => c.class_id === class_id)) {
                navigate(`/dashboard/${classes[0].class_id}/${select ? select : 'all'}`);
            }
            displayInformation(classes);
            setClassList(classes);


            setListSolo(rooms);
            setLoadingSolo(false);
            setSoloCount(rooms.length);
        }
        init();
    }, []);

    useEffect(() => {
        if (class_list.length > 0) {
            displayInformation(class_list);
        }
    }, [class_id])

    async function displayInformation (classes = []) {
        setLoadingTeams(true);
        setLoadingActivities(true);

        if (classes.length > 0) {
            const info = classes.find((c) => c.class_id === class_id);

            if (info) {    
                setClassInfo({
                    class_id: info.class_id,
                    course_code: info.course_code,
                    course_title: info.course_title,
                    section: info.section,
                })    

                displayTeams(await professor.getTeams(class_id));
                displayActivities(await professor.getActivities(class_id));    

                setHeaderName(<>{info.course_code} {info.section}</>);
            } else {
                navigate(`/dashboard/${classes[0].class_id}/${select ? select : 'all'}`);
            }
        } else {
            navigate(`/dashboard`)
            setNoCourse(true);
        }
    }
        
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
        const room = await professor.createSoloRoom();

        if (room) {
            navigate(`/solo/${room}`);
            toast.success('New solo room has been created.');
        }
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
            <Sidebar user={professor} courses={class_list} setShowStudents={setShowStudents}/>
            <section className='dash-section flex-column'>
                <button id='dash-burger' className='items-center' onClick={ showSidebar }><BsListUl size={ 30 }/></button>
                <div className='display-content flex-column'>
                    {class_info &&
                        <div className='content-header'>
                            <button className={`${!showStudents && 'active'}`} onClick={() => setShowStudents(false)}>
                                Class Info
                            </button>
                            <button className={`${showStudents && 'active'}`} onClick={() => setShowStudents(true)}>
                                Students
                            </button>
                        </div>
                    }
                    <div className={`flex-column ${showStudents && 'none'}`}>
                    {class_info &&
                        <div id='course-info' className='flex-column'>
                            <label className='full-title'>{class_info.course_code} {class_info.course_title}</label>
                            <label className='sub-title'>Section: {class_info.section}</label>
                        </div>
                    }
                    <div className='content-header' id='show-solo-rooms'>
                        <label className='title-course'></label>
                        <label className='course-title'></label>  
                    </div>

                    {class_id &&
                        <>
                            <div className={`separator ${(select === 'activities' || select === 'solo') && 'none'}`} id='show-teams'>
                                <div className='section-title'>
                                    <label>Teams <span>({team_count})</span> </label>
                                </div>
                                {loading_teams 
                                    ? <div className='in-retrieve'>Retrieving...</div>
                                    : <TeamBoard uid={professor.uid} 
                                                 teams={list_teams} 
                                                 openTeamPopup={openTeamPopup}/>
                                }
                            </div>
                            <div className={`separator ${(select === 'teams' || select === 'solo') && 'none'}`} id='show-teams'>
                                <div className='section-title'>
                                    <label>Group Activities <span>({activity_count})</span></label>
                                </div>
                                {loading_activities
                                    ? <div className='in-retrieve'>Retrieving...</div> 
                                    : <ActivityBoard activities={list_activities}/>
                                }
                                {!loading_activities &&
                                    <button className='create-btn' onClick={openActivityPopup}>Create Activity</button>
                                }
                            </div>
                        </>
                    } 
                    {noCourse &&
                        <div className='no-course'>
                            <label>Ask the admin if you want to add a class.</label>
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
                    {class_info &&
                        <StudentList 
                            class_info={class_info}
                            user={professor} 
                            showStudents={showStudents}/>
                    }
                </div>
                {
                    isTeamModalOpen && 
                    ( <CreateTeam 
                        user={professor} 
                        class_info={class_info}
                        exit={() => {setIsTeamModalOpen(false)}} /> )
                }
                {
                    isActivityModalOpen && 
                    ( <CreateActivity
                        user={professor} 
                        class_info={class_info}
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