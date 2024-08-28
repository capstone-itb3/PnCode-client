import React, { useState, useEffect } from 'react';
import { BsXLg, BsExclamationCircleFill } from 'react-icons/bs';

function CreateTeam({ teams, user, course, section, exit }) {
  const [team_name, setTeamName] = useState('');
  
  async function submitTeam(e) {
    e.preventDefault();
    await user.createTeam(team_name, course, section);
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
            <div className='flex-row sub-head'>
                <label><b>Course:</b> {course}</label>
                <label><b>Section:</b> {section}</label>
            </div>
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
            <div className='flex-column'>
              <h3>Team Members</h3>
              <label>You can add your members after team creation.</label>
            </div>
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

export default CreateTeam;