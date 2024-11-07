import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BsTrash, BsPlus } from 'react-icons/bs';
import { FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import Header from '../Header';
import { getToken, getClass } from '../../validator';
import ManageDates from './ManageDates';
import { MdLoop } from 'react-icons/md';
import { showConfirmPopup } from '../../reactPopupService'

function PageActivity() {
    const { activity_id } = useParams();
    const navigate = useNavigate();
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));
    const [professor, setProfessor ] = useState(getClass(auth, 'Professor'));
    const [activity, setActivity] = useState(null);
    const [room_list, setRoomList] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [showInstructionInputs, setShowInstructionInputs] = useState(false);
    const [course_code, setCourseCode] = useState(null);
    const [section, setSection] = useState(null);
  
    useEffect(() => {
        async function init () {
            await renderActivity();
        }
        init()
    }, [])

    async function renderActivity () {
        const act_info = await professor.getActivityDetails(activity_id);

        setActivity(act_info.activity_class);
        setInstructions(act_info.activity_class.instructions);
        setRoomList(act_info.rooms);

        setCourseCode(act_info.course_code);
        setSection(act_info.section);
    
        document.title = `Activity · ${act_info.activity_class.activity_name}`;
    }
    
    async function spectateRoom (room_id) {
        navigate(`/room/${room_id}`);
    }

    function toggleInstructions() {
        setShowInstructionInputs(!showInstructionInputs);

        const edit = document.getElementById('edit-instructions');

        if (showInstructionInputs === false) {
            edit.textContent = 'Cancel';
            edit.classList.value = 'cancel-btn'
        } else {
            edit.textContent = 'Edit Instructions';
            edit.classList.value = 'create-btn'
        }

    }

    async function updateInstructions () {
        const result = await activity.updateInstructions(instructions);
        if (result) {
            toast.success('Instructions saved.');
            toggleInstructions();
            await renderActivity();
        }
    }



    async function deleteActivity () {
        const confirm1 = await showConfirmPopup({
            title: 'Delete An Activity',
            message: `Are you sure you want to delete the activity ${activity.activity_name}?`,
            confirm_text: 'Delete',
            cancel_text: 'Cancel',
        });
        
        if (confirm1) {
            const confirm2 = await showConfirmPopup({
                title: 'Delete An Activity',
                message: `Deleting this activity is irreversible and students will lose their work. Do you want to continue?`,
                confirm_text: 'Continue Deleting',
                cancel_text: 'Cancel',
            });
        
            if (confirm2) {
                const deleted = await activity.deleteActivity();
                if (deleted) {
                    navigate(`/dashboard/${activity.class_id}/all`);
                }
            }
        }
    }


    return (
        <>
        {activity && room_list &&
        (
        <>
            <Header user={professor} base={'Activity'} name={activity.activity_name}/>
            <div id='activity-main'> 
                <div id='activity-container' className='flex-column'>
                    <div id='activity-header'>
                        <div className='flex-row items-center'>
                            <h2>{activity.activity_name}</h2>
                            <button className='reload-btn items-center' onClick={renderActivity}>
                                <MdLoop size={24} />
                            </button>
                        </div>
                        <div className='two-column-grid'>
                            <label>Course: <b>{course_code}</b></label>
                            <label>Section: <b>{section}</b></label>
                        </div>
                    </div>
                    <div className='flex-column'>
                    <h3>Instructions</h3>
                    {!showInstructionInputs &&
                        <p className='instructions'>{activity.instructions}</p>
                    }
                    {showInstructionInputs &&
                        <textarea   
                            className='instructions'
                            value={instructions} 
                            onChange={(e) => setInstructions(e.target.value)}/>
                    }
                        <div>
                            {showInstructionInputs &&
                                <button className='create-btn' onClick={updateInstructions}>Save</button>
                            }
                            <button 
                                id='edit-instructions' 
                                className='create-btn' 
                                onClick={() => toggleInstructions()}>
                                Edit Instructions
                            </button>
                        </div>
                    </div>
                    <div id='activity-room-list'>
                       <h3>Rooms</h3>
                            {room_list.length === 0 &&
                                <div className='length-0 flex-column items-center'>
                                    <label>Rooms will fill in as teams join the activity.</label>
                                </div>
                            } 
                            <div className='two-column-grid'>
                            {room_list.length > 0 &&
                                room_list.map((room, index) => {
                                    return (
                                        <div className='assigned-item flex-row items-center' onClick={() => {spectateRoom(room.room_id)}} key={index}>
                                            <div className='col-1'>{index + 1}</div>
                                            <div className='col-2'>
                                                <label className='single-line'>{room.room_name.slice(0, -4)}<span>{room.room_name.slice(-4)}</span></label>
                                            </div>
                                            <div className='col-3 flex-row'>
                                                <Link to={`/room/${room.room_id}`} className='items-center'>View Room <FaChevronRight size={18}/></Link>
                                            </div>
                                        </div>
                                    )
                            })}
                            </div>
                    </div>
                    <ManageDates activity={activity} renderActivity={renderActivity}/>

                    <div id='activity-footer'>
                    <Link to={`/dashboard/${activity.class_id}/all`}>&lt; BACK TO DASHBOARD</Link>
                        <button id='delete-btn' onClick={deleteActivity}><BsTrash size={20}/><label>Delete Activity</label></button>
                    </div>
                </div>
            </div>
        </>
        )}
        </>
    )
}

export default PageActivity