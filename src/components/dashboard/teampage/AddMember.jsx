import React, { useEffect, useState, useRef } from 'react'
import UserAvatar from '../../UserAvatar';
import { BsPersonPlus } from 'react-icons/bs';
import { showConfirmPopup, showAlertPopup } from '../../reactPopupService';
import handleMenu from '../utils/handleMenu';

function AddMember({team, user}) {
    const [search, setSearch] = useState('');
    const [student_list, setStudentList] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const addMemberRef = useRef(null);

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

    useEffect(() => {  
        function handleClickOutside(e) {
          handleMenu(addMemberRef.current, setShowResults, e.target);
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [addMemberRef]);    

    async function addStudentToTeam(student) {
        setSearch(`${student.first_name} ${student.last_name}`);
        setShowResults(false);

        const isAvailable = await team.checkStudentAvailability(student.uid);

        if (!isAvailable) {
            return;
        }

        const confirmed = await showConfirmPopup({
            title: 'Add Student To Team',
            message: `Do you want to add ${student.first_name} ${student.last_name} to team ${team.team_name}?`,
            confirm_text: 'Add Student',
            cancel_text: 'Cancel'
        })

        if (confirmed) {
            const invited = await team.inviteStudent(student.uid);
            
            if (invited) {
                await showAlertPopup({
                    title: 'Student Invited!',
                    message: `A team invite has been sent to ${student.first_name} ${student.last_name}.`,
                    okay_text: 'Okay'
                })
                setSearch('');
            }
        }
    }

    return (
        <div className='add-member-div flex-row'>
            <div className='items-center'>
                <BsPersonPlus size={20} />
            </div>
            <div className='flex-column add-member-search' ref={addMemberRef}>
                <input
                    className='input-data'
                    type='text' 
                    value={search} 
                    placeholder='Search for a student by their name'
                    onFocus={() => {setShowResults(true)}}
                    onChange={(e) => {setSearch(e.target.value)}}
                />
                {showResults &&
                    <div id='search-results-div' className='width-100'>
                        <SearchStudents students_list={student_list} search={search} addStudentToTeam={addStudentToTeam}/>
                    </div>
                }
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
            return (
              <li key={index} className='member-search-item flex-row items-center' onClick={() => (addStudentToTeam(s))}>
                <UserAvatar name={`${s.last_name}, ${s.first_name.charAt(0)}`} size={24}/>
                <label className='single-line'>{s.last_name}, {s.first_name}</label>
              </li>
            );  
        }) : null}
      </ul>
    )
  }
  

export default AddMember