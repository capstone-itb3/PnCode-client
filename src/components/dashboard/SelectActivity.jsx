import React, { useEffect, useState } from 'react'
import { BsPencilSquare } from 'react-icons/bs';

function SelectActivity({ activity, index, onClick }) {
    const createdAt = () => {
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
    };

    const open_time = () => {
        const [hours, minutes] = activity.open_time.split(':');
        
        const HH = (parseInt(hours) % 12 || 12) < 10 ? `0${parseInt(hours) % 12 || 12}` : parseInt(hours) % 12 || 12;
        const mm = parseInt(minutes) < 10 ? `0${parseInt(minutes)}` : minutes;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${HH}:${mm} ${ampm}`;    
    }

    const close_time = () => {
        const [hours, minutes] = activity.close_time.split(':');
        
        const HH = (parseInt(hours) % 12 || 12) < 10 ? `0${parseInt(hours) % 12 || 12}` : parseInt(hours) % 12 || 12;
        const mm = parseInt(minutes) < 10 ? `0${parseInt(minutes)}` : minutes;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${HH}:${mm} ${ampm}`;    
    }

    
    return (
        <div className='activity-box flex-column' onClick={onClick}>
            <label className='name'>
                <label>{activity.activity_name}</label>
                <span className='items-center'><BsPencilSquare size={ 20 }/></span>
            </label>
            <div className='instruc-div'>
                <p className='instructions'>{activity.instructions}</p>
            </div>
            <div className='dates'>
                <label>Created: {createdAt()}</label>
                <label>Access: {open_time()} - {close_time()}</label>
            </div>
        </div>
    )
}

export default SelectActivity