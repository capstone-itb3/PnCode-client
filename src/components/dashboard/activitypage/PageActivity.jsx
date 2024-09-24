import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsTrash, BsPlus } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import Header from '../Header';
import { getToken, getClass } from '../../validator';
import ManageDates from './ManageDates';
import { MdLoop } from 'react-icons/md';

function PageActivity() {
    const { activity_id } = useParams();
    const navigate = useNavigate();
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));
    const [professor, setProfessor ] = useState(getClass(auth, 'Professor'));
    const [activity, setActivity] = useState(null);
    const [room_list, setRoomList] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [showInstructionInputs, setShowInstructionInputs] = useState(false);

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
        const result1 = confirm('Are you sure you want to delete this activity?');
        if (result1) {
            const result2 = confirm('Deleting an activity is irreversible and the students will lose their work. Are you sure you want to delete this activity?');
            if (result2) {
                const deleted = await activity.deleteActivity();
                if (deleted) {
                    navigate(`/dashboard/${activity.course_code}/${activity.section}/all`);
                }
            }
        }
    }


    return (
        <>
        {activity && room_list &&
        (
        <>
            <Header auth={auth} base={'Activity'} name={activity.activity_name}/>
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
                            <label>Course: <b>{activity.course_code}</b></label>
                            <label>Section: <b>{activity.section}</b></label>
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
                        <table id='assigned-table'>
                            <tbody>
                            {room_list.length === 0 &&
                                (
                                    <tr className='assigned-item empty'>
                                        <td className='col-1'>
                                            <label>Rooms will fill in as student teams join the activity.</label>
                                        </td>
                                    </tr>
                            )} 
                            {room_list.length > 0 &&
                                room_list.map((room, index) => {
                                    return (
                                        <tr className='assigned-item' onClick={() => {spectateRoom(room.room_id)}} key={index}>
                                            <td className='col-1'>
                                                <label>{index + 1}</label>
                                            </td>
                                            <td className='col-2'>
                                                <label className='single-line'>{room.room_name.slice(0, -4)}<span>{room.room_name.slice(-4)}</span></label>
                                            </td>
                                        </tr>
                                    )
                            })}
                            </tbody>
                        </table>
                    </div>
                    <ManageDates activity={activity} renderActivity={renderActivity}/>

                    <div id='activity-footer'>
                    <a href={`/dashboard/${activity.course_code}/${activity.section}/all`}>&lt; BACK</a>
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