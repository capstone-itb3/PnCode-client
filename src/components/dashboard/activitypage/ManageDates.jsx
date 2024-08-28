import React, { useEffect, useState } from 'react';

function ManageDates({activity, renderActivity}) {
    const [showAccessInputs, setShowAccessInputs] = useState(false);
    const [showDeadlineInputs, setShowDeadlineInputs] = useState(false);
    const [open_time, setOpenTime] = useState();
    const [close_time, setCloseTime] = useState();
    const [deadline, setDeadline] = useState();
    const [new_open_time, setNewOpenTime] = useState(activity.open_time);
    const [new_close_time, setNewCloseTime] = useState(activity.close_time);
    const [new_deadline, setNewDeadline] = useState(() => {
        const offset = new Date(activity.deadline).getTimezoneOffset();
        return new Date(new Date(activity.deadline).getTime() - (offset * 60 * 1000)).toISOString().slice(0, 16);
    });
    
    useEffect(() => {
        setOpenTime(() => {
            const [hours, minutes] = activity.open_time.split(':');
        
            const HH = (parseInt(hours) % 12 || 12) < 10 ? `0${parseInt(hours) % 12 || 12}` : parseInt(hours) % 12 || 12;
            const mm = parseInt(minutes) < 10 ? `0${parseInt(minutes)}` : minutes;
            const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
            return `${HH}:${mm} ${ampm}`;    
        });
        setCloseTime(() => {
            const [hours, minutes] = activity.close_time.split(':');
    
            const HH = (parseInt(hours) % 12 || 12) < 10 ? `0${parseInt(hours) % 12 || 12}` : parseInt(hours) % 12 || 12;
            const mm = parseInt(minutes) < 10 ? `0${parseInt(minutes)}` : minutes;
            const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
            return `${HH}:${mm} ${ampm}`;
        });
        setDeadline(() => {
            const dl = new Date(activity.deadline);

            const day = dl.getDate() < 10 ? '0' + dl.getDate() : dl.getDate();
            const month = dl.toLocaleString('default', { month: 'long' });
            const year = dl.getFullYear();
            const hours = dl.getHours() < 10 ? '0' + dl.getHours() : dl.getHours();
            const minutes = dl.getMinutes() < 10 ? '0' + dl.getMinutes() : dl.getMinutes();
            const ampm = dl.getHours() < 12 ? 'AM' : 'PM';
        
            return `${day}, ${month} ${year}. ${hours}:${minutes} ${ampm}`;    
        });

    }, [activity.open_time, activity.close_time, activity.deadline]);

    function toggleAccess(show) {
        const edit = document.getElementById('edit-timeframe');

        if (show === false) {
            setShowAccessInputs(true);
            edit.textContent = 'Cancel';
            edit.classList.value = 'cancel-btn'
        } else {
            setShowAccessInputs(false);
            edit.textContent = 'Edit Timeframe';
            edit.classList.value = 'create-btn'
        }
    }

    function toggleDeadline(show) {
        const edit = document.getElementById('edit-deadline');


        if (show === false) {
            setShowDeadlineInputs(true);
            edit.textContent = 'Cancel';
            edit.classList.value = 'cancel-btn'
        } else {
            setShowDeadlineInputs(false);
            edit.textContent = 'Edit Deadline';
            edit.classList.value = 'create-btn'
        }
    }

    async function updateDates() {
        const updated = await activity.updateDates(new_open_time, new_close_time, new_deadline);

        if (updated) {        
            await renderActivity();    
            // setOpenTime(new_open_time);
            // setCloseTime(new_close_time);
            // setDeadline(new_deadline);

            toggleAccess(true);
            toggleDeadline(true);
        }
    }

    return (
        <div id='display-dates'>
            <h3>Access Timeframes</h3>
            <div className='two-column-grid'>
            {!showAccessInputs &&
            <div>
                <label>Open Time: </label>
                <label>{open_time}</label>
            </div>
            }
            {!showAccessInputs &&
                <div>
                    <label>Close Time: </label>
                    <label>{close_time}</label>
                </div>
            }
            {showAccessInputs &&
                <div>
                    <label>Open Time </label>
                    <input type='time' value={new_open_time} onChange={(e) => {setNewOpenTime(e.target.value)}}/>
                </div>
            }
            {showAccessInputs &&
                <div>  
                    <label>Close Time </label>
                    <input type='time' value={new_close_time} onChange={(e) => {setNewCloseTime(e.target.value)}}/>
                </div>
            }
            </div>
            {showAccessInputs &&
                <button className='create-btn' onClick={updateDates}>Save</button>
            }
            <button id='edit-timeframe' className='create-btn' onClick={() => toggleAccess(showAccessInputs)}>Edit Timeframes</button>
            <h3>Deadline</h3>
            <div className='two-column-grid'>
                {!showDeadlineInputs &&
                   <label>{deadline}</label>
                }
                {showDeadlineInputs &&
                    <input type='datetime-local' value={new_deadline} onChange={(e) => {setNewDeadline(e.target.value)}}/>
                }
            </div>
            {showDeadlineInputs &&
                <button className='create-btn' onClick={updateDates}>Save</button>
            }
            <button id='edit-deadline' className='create-btn' onClick={() => toggleDeadline(showDeadlineInputs)}>Edit Deadline</button>
        </div>
    )
}


export default ManageDates;