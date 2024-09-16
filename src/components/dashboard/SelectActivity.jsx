import React, { useEffect, useState } from 'react'
import { BsPencilSquare } from 'react-icons/bs';

function SelectActivity({ activity, index, onClick }) {
    const [createdAt, setCreatedAt] = useState(() => {
        const diff = new Date() - new Date(activity.createdAt);
        const timeUnits = [
            { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)), unit: 'year' },
            { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), unit: 'month' },
            { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 7)), unit: 'week' },
            { value: Math.floor(diff / (1000 * 60 * 60 * 24)), unit: 'day' },
            { value: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), unit: 'hour' },
            { value: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), unit: 'minute' }
        ];
    
        for (const { value, unit } of timeUnits) {
            if (value > 0) {
                return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    });
    
    return (
        <div className='activity-box flex-column' onClick={onClick}>
            <label className='name'>
                <span><BsPencilSquare size={ 20 }/></span>
                {activity.activity_name}
            </label>
            <div className='instruc-div'>
                <p className='instructions'>{activity.instructions}</p>
            </div>
            <div className='dates'>
                <label>Created: {createdAt}</label>
            </div>
        </div>
    )
}

export default SelectActivity