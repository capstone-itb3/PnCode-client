import React, { useState, useEffect } from 'react';
import { BsXLg, BsExclamationCircleFill } from 'react-icons/bs';

function CreateTeam({ user, course, section, exit }) {
  const [team_name, setTeamName] = useState('');
  const [search, setSearch] = useState('');
  const [student_list, setStudentList] = useState([]);
  const [students_selected, setStudentsSelected] = useState([]);
  const [warning, setWarning] = useState(0);

  useEffect(() => {
    async function init() {
      const students = await user.getCourseStudents(course, section);
      setStudentList(students);

      setStudentsSelected([]);
      showSearchResults(false);
      setSearch('');
    }
    init();
  }, []);

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

  function addToSelectedList(student) {
    if (!students_selected.includes(student)) {
      setStudentsSelected([...students_selected, student]);
      setWarning(0);
      setSearch('');

    } else {
      setWarning(1);
    }
  }

  function removeFromSelectedList(student) {
    setStudentsSelected(students_selected.filter((s) => {
      return s.uid !== student.uid;
    }));
  }
  
  async function submitTeam(e) {
    e.preventDefault();
    const members = students_selected;

    if (user.position === 'Student') {
      members.unshift({
        uid: user.uid,
        first_name: user.first_name,
        last_name: user.last_name
      });
    } 

    console.log(members);

    if (members.length >= 2) {
      await user.createTeam(team_name, course, section, members);

    } else {
      setWarning(2);
      return;
    }
  }

  return (
    <div id='popup-gray-background' className='items-start'>
      <div id='create-popup' className='team'>
        <div className='scroll'>
          <div id='popup-close'onClick={ exit } >
            <BsXLg size={ 18 }/>
          </div>
          <form autoComplete='off' onSubmit={(e) => submitTeam(e)}>
            <h2 className='head'>Create A New Team</h2>
            <div className='flex-column'>
              <h3>Team Name</h3>
              <input 
                className='input-data'
                type='text'
                value={team_name}
                placeholder='Enter your team name'
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <div className='flex-row'>
              <div className='flex-column'>
                <h3>Course</h3>
                <label id='display-section'>{course}</label>
              </div>
              <div className='flex-column'>
                <h3>Section</h3>
                <label id='display-section'>{section}</label>
              </div>
            </div>
            <div className='flex-column'>
              <div className='flex-row'>
                <h3>Team Members</h3>
                {warning === 1 &&
                  <label className='label-warning'>
                    <BsExclamationCircleFill size={ 15 } style={{ padding: '0 5px' }}/>
                    Student is already selected.
                  </label>
                }
              </div>
              <input 
                className='input-data'
                type='text' 
                value={search} 
                placeholder='Search for a student by their name'
                onFocus={() => {showSearchResults(true)}}
                onBlur={() => {showSearchResults(false)}}
                onChange={(e) => {setSearch(e.target.value)}}
              />
              <div id='search-results-div' className='width-100'>
                <SearchStudents students_list={student_list} search={search} addToSelectedList={addToSelectedList}/>
              </div>
            </div>
            <div className='flex-column' id='chosen-members'>
                {students_selected[0] ? students_selected.map((s) => {
                  return (
                    <div key={s.uid} className='flex-row member-selected'>
                        <label>{s.first_name} {s.last_name}</label>
                        <input 
                          type='button' 
                          value='Remove'
                          className='remove-member' 
                          onClick={() => {removeFromSelectedList(s)}}/>
                    </div>
                  )
                }) : null}
            </div>
            {warning === 2 &&
              <label className='label-warning'>
                <BsExclamationCircleFill size={ 15 } style={{ padding: '0 5px' }}/>
                Team must consist of two or more members.
              </label>
            }
            <div className='flex-row footer'>
              <input 
                type='submit' 
                id='popup-submit' 
                value='Create Team' 
              />
              <input type='button' id='popup-cancel' value='Cancel' onClick={exit}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function SearchStudents({ students_list, search, addToSelectedList }) {
  const filter = students_list.filter((s) => {

    const inclFirstName = s.first_name.toLowerCase().includes(search.toLowerCase());
    const inclLastName = s.last_name.toLowerCase().includes(search.toLowerCase());

    return ( inclFirstName || inclLastName);
  });
  
  return (
    <ul id='member-search-list'>
    {filter ? filter.map((s, index) => {
        return (
          <li key={index} className='member-search-item' onClick={() => (addToSelectedList(s))}>
            {s.first_name} {s.last_name}
          </li>
        );
      }) : null}
    </ul>
  )
}

export default CreateTeam;