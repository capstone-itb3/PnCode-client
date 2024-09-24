import React, { useEffect, useState } from 'react';

function ManageDates({activity, renderActivity}) {
    const [showAccessInputs, setShowAccessInputs] = useState(false);
    const [open_time, setOpenTime] = useState();
    const [close_time, setCloseTime] = useState();
    const [new_open_time, setNewOpenTime] = useState(activity.open_time);
    const [new_close_time, setNewCloseTime] = useState(activity.close_time);
    
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

    }, [activity.open_time, activity.close_time]);

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

    async function updateDates() {
        const updated = await activity.updateDates(new_open_time, new_close_time);

        if (updated) {        
            await renderActivity();    
            toggleAccess(true);
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
        </div>
    )
}


export default ManageDates;