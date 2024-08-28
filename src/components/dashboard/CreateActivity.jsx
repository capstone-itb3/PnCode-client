import React, { useState, useEffect } from 'react'
import { BsXLg } from 'react-icons/bs';
import { BsExclamationCircleFill } from 'react-icons/bs';

function CreateActivity({user, course, section, exit}) {
    const [activity_name, setActivityName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [open_time, setOpenTime] = useState('07:00');
    const [close_time, setCloseTime] = useState('20:59');
    const [deadline, setDeadline] = useState(() => {
        const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return date.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    });
        
    async function submitActivity(e) {
        e.preventDefault();

        user.createActivity(course, section, activity_name, instructions, open_time, close_time, deadline);
    }

    return (
        <div id='popup-gray-background' className='items-start'>
            <div id='create-popup' className='activity'>
                <div className='scroll'>
                    <div id='popup-close'onClick={ exit } >
                        <BsXLg size={ 18 }/>
                    </div>
                    <form autoComplete='off' onSubmit={(e) => submitActivity(e)}>
                        <h2 className='head'>Create A Group Activity</h2>
                        <div className='flex-column width-100'>
                            <h3>Activity Name</h3>
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
                            <h3>Instructions</h3>
                            <textarea 
                                value={instructions}
                                placeholder='Enter the instructions'
                                onChange={(e) => setInstructions(e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex-column'>
                            <h3>Access Timeframe</h3>
                            <div className='flex-row' id='chosen-timeframe'>
                                <label>Time Open:</label>
                                <input 
                                    className='date-time'
                                    type='time'
                                    value={open_time}
                                    onChange={(e) => setOpenTime(e.target.value)}
                                    required
                                />
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
                        <div className='flex-column items-start'>
                            <h3>Deadline</h3>
                            <input 
                                className='date-time'
                                type='datetime-local'
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                            />
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