import React from 'react';
import UserAvatar from '../UserAvatar';

function SearchStudents({ students_list, search, addFunction, showEmail }) {
    const filter = students_list.filter((s) => {
        if (search === '') {
            return students_list;
        }
        const firstThenLast = `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase());
        const lastThenFirst = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(search.toLowerCase());
        return (firstThenLast || lastThenFirst)
    });
    
    return (
    <ul id='member-search-list'>
        {filter && filter.map((s, index) => {
            return (
            <li key={index} className='member-search-item flex-row items-center' onClick={() => (addFunction(s))}>
                <UserAvatar name={`${s.last_name}, ${s.first_name.charAt(0)}`} size={24}/>
                <label className='single-line'>{s.last_name}, {s.first_name}</label>
                {showEmail && <span className='email single-line'>{s.email}</span>}
            </li>
            );  
        })}
        {filter.length === 0 &&
            <li className='member-search-item flex-row items-center zero'>
                <label>No students found.</label>
            </li>
        }
    </ul>
    )
}

export default SearchStudents;