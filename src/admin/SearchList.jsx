import React from 'react';

export function SearchUserList({ list, filter, selectUser }) {
    const results = list.filter((f) => {
        const firstThenLast = `${f.first_name} ${f.last_name}`.toLowerCase().includes(filter.toLowerCase());
        const lastThenFirst = `${f.last_name}, ${f.first_name}`.toLowerCase().includes(filter.toLowerCase());
        return (firstThenLast || lastThenFirst)

    // } else if (list_type === 'class') {
    //   const uid = `${f.uid}`.toLowerCase().includes(filter.toLowerCase());
    //   const course_code = `${f.course_code}`.toLowerCase().includes(filter.toLowerCase());
    //   const section = `${f.section}`.toLowerCase().includes(filter.toLowerCase());
    //   const combined = `${f.uid} ${f.course_code} ${f.section}`.toLowerCase().includes(filter.toLowerCase());
    //   return (uid || course_code || section || combined);
    });

    return (
    <div className='collection-search-div'>
        <ul className='collection-search-list'>
            {results && results.map((item) => (
                <li key={item.uid}
                    className='single-line'
                    onClick={() => selectUser(item)}>
                    {item.first_name} {item.last_name}
                </li>
            ))}
        </ul>
    </div>
    )
}  

export function SearchCourseList({ list, filter, selectFunction }) {
    const results = list.filter((f) => {
        return `${f.course_code}`.toLowerCase().includes(filter.toLowerCase());
    });

    return (
    <div className='collection-search-div'>
        <ul className='collection-search-list'>
            {results && results.map((item) => (
                <li key={item.course_code}
                    className='single-line'
                    onClick={() => selectFunction(item.course_code)}>
                    {item.course_code}
                </li>
            ))}
        </ul>
    </div>
    )
}