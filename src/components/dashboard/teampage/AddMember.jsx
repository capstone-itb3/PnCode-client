import React, { useEffect, useState } from 'react'
import UserAvatar from '../../UserAvatar';
import { showConfirmPopup } from '../../reactPopupService'

function AddMember({team, user, renderTeam}) {
    const [search, setSearch] = useState('');
    const [student_list, setStudentList] = useState([]);

    useEffect(() => {
        async function init() {
            const students = await user.getCourseStudents(team.class_id, 'students');
            const filtered = students.filter((s) => {
                return !team.members.map((m) => { 
                    return m.uid; 
                }).includes(s.uid);
            });         
            setStudentList(filtered);
        }
        init();
    }, [team.members]);

    function showSearchResults(bool) {
        const search_list = document.getElementById('member-search-list');

        if (bool) {
            search_list.style.visibility = 'visible';
            search_list.style.opacity = 1;
        } else {
            search_list.style.opacity = 0
            
            setTimeout(() => { 
                search_list.style.visibility = 'hidden';  
            }, 350);
        }
    }

    async function addStudentToTeam(student) {
        const confirmed = await showConfirmPopup({
            title: 'Add Student To Team',
            message: `Are you sure you want to add ${student.first_name} ${student.last_name} to team ${team.team_name}?`,
            confirm_text: 'Add Student',
            cancel_text: 'Cancel'
        })

        if (confirmed) {
            const added = await team.addMember(student);
            setSearch('');
            
            if (added) {
                team.members.push({
                    uid: student.uid,
                    first_name: student.first_name,
                    last_name: student.last_name
                });
                renderTeam();
            }
            showSearchResults(false);
        }
    }

    return (
        <div className='add-member-search flex-column'>
            <input 
                className='input-data'
                type='text' 
                value={search} 
                placeholder='Search for a student by their name'
                onFocus={() => {showSearchResults(true)}}
                onChange={(e) => {setSearch(e.target.value)}}
            />
            <div id='search-results-div' className='width-100'>
                <SearchStudents students_list={student_list} search={search} addStudentToTeam={addStudentToTeam}/>
            </div>
        </div>
    )
}
  

function SearchStudents({ students_list, search, addStudentToTeam }) {
    const filter = students_list.filter((s) => {
        const firstThenLast = `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase());
        const lastThenFirst = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(search.toLowerCase());
        return (firstThenLast || lastThenFirst)
    });
    
    return (
      <ul id='member-search-list'>
      {filter ? filter.map((s, index) => {
          if (index < 4) {
            return (
              <li key={index} className='member-search-item flex-row items-center' onClick={() => (addStudentToTeam(s))}>
                <UserAvatar name={`${s.last_name}, ${s.first_name.charAt(0)}`} size={24}/>
                <label className='single-line'>{s.last_name}, {s.first_name}</label>
              </li>
            );  
          }      
        }) : null}
      </ul>
    )
  }
  

export default AddMember