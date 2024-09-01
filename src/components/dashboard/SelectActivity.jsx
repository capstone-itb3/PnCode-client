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
    
    const [deadline, setDeadline] = useState(() => {
        const date = new Date(activity.deadline);

        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const month = date.toLocaleString('default', { month: 'long' }).slice(0, 3);
        const year = date.getFullYear();
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const ampm = date.getHours() < 12 ? 'AM' : 'PM';
    
        return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
    });

    return (
        <div className='activity-box flex-column' onClick={onClick}>
            <label className='name'>
                <BsPencilSquare size={ 20 }/>
                <span>{Date.now() > new Date(activity.deadline) ? ' Closed • ' :' '}</span>
                {activity.activity_name}
            </label>
            <div className='instruc-div'>
                <p className='instructions'>{activity.instructions}</p>
            </div>
            <div className='dates'>
                <label  >Created: {createdAt}</label>
                <label>Deadline: {deadline}</label>
            </div>
        </div>
    )
}

export default SelectActivity