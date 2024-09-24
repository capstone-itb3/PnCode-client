import React, { useState, useEffect } from 'react'
import { BsXLg } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BsExclamationCircleFill } from 'react-icons/bs';

function CreateActivity({user, course, section, exit}) {
    const [activity_name, setActivityName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [open_time, setOpenTime] = useState('07:00');
    const [close_time, setCloseTime] = useState('20:59');
    const navigate = useNavigate();
        
    async function submitActivity(e) {
        e.preventDefault();

        const timeToMinutes = (timeString) => {
            const [hours, minutes] = timeString.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const openMinutes = timeToMinutes(open_time);
        const closeMinutes = timeToMinutes(close_time);
    
        if (closeMinutes <= openMinutes) {
            toast.error('Close time must be later than open time.');
            return;
        } 

        const created = await user.createActivity(course, section, activity_name, instructions, open_time, close_time);

        if (created) {
            navigate(`/activity/${created}`);
        }
    }



    return (
        <div id='popup-gray-background' className='items-start'>
            <div id='create-popup' className='activity'>
                <div className='scroll'>
                    <div id='popup-close'onClick={ exit } >
                        <BsXLg size={ 18 }/>
                    </div>
                    <form autoComplete='off' onSubmit={(e) => submitActivity(e)}>
                        <h3 className='head'>Create A Group Activity</h3>
                        <div className='two-column-grid'>
                            <label>Course: <b>{course}</b></label>
                            <label>Section: <b>{section}</b></label>
                        </div>
                        <div className='flex-column width-100'>
                            <h4>Activity Name</h4>
                            <input 
                                className='input-data'
                                type='text'
                                value={activity_name}
                                placeholder='Enter the name of the activity'
                                onChange={(e) => setActivityName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex-column'>
                            <h4>Instructions</h4>
                            <textarea 
                                value={instructions}
                                placeholder='Enter the instructions'
                                onChange={(e) => setInstructions(e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex-column'>
                            <div className='flex-row'>
                                <h4>Access Timeframe</h4>
                            </div>
                            <div className='two-column-grid' id='chosen-timeframe'>
                                <div className='flex-row items-center'>
                                    <label>Time Open:</label>
                                    <input 
                                        className='date-time'
                                        type='time'
                                        value={open_time}
                                        onChange={(e) => setOpenTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='flex-row items-center'>
                                <label>Time Close:</label>
                                <input 
                                    className='date-time'
                                    type='time'
                                    value={close_time}
                                    onChange={(e) => setCloseTime(e.target.value)}
                                    required
                                />
                                </div>
                            </div>
                        </div>
                        <div className='flex-row footer'>
                            <input 
                                type='submit' 
                                id='popup-submit' 
                                value='Create Activity' 
                            />
                            <input type='button' id='popup-cancel' value='Cancel' onClick={exit}/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateActivity