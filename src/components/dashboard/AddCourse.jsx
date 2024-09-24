import React, { useState } from 'react'
import { BsXLg } from 'react-icons/bs';
import toast from 'react-hot-toast';


function AddCourse({user, exit}) {
  const [course_code, setCourseCode] = useState('');
  const [section, setSection] = useState('');


  async function requestCourse(e) {
    e.preventDefault();
    const request = await user.requestCourse(course_code, section);

    if (request) {
      exit();
      toast.success('Wait for your professor to accept your request.');
    }
  }

  return (
    <div id='popup-gray-background' className='items-start'>
      <div id='create-popup' className='course'>
        <div className='scroll'>
          <div id='popup-close'onClick={ exit } >
            <BsXLg size={ 18 }/>
          </div>
          <form autoComplete='off' onSubmit={(e) => requestCourse(e)}>
            <h3 className='head'>Join A Course</h3>
            <div className='flex-row two-column-grid'>
              <div className='flex-column'>
                <h4>Course Code</h4>
                <input 
                  className='input-data'
                  type='text'
                  value={course_code}
                  placeholder='Course code'
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>
              <div className='flex-column'>
              <h4>Section</h4>
                <input 
                  className='input-data'
                  type='text'
                  value={section}
                  placeholder='Section'
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='flex-row footer'>
              <input 
                type='submit' 
                id='popup-submit' 
                value='Join Course' 
              />
              <input type='button' id='popup-cancel' value='Cancel' onClick={exit}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddCourse