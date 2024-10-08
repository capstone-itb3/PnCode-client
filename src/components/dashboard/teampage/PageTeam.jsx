import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { BsTrash  } from 'react-icons/bs';
import { LuPencilLine } from 'react-icons/lu';
import { MdLoop } from 'react-icons/md';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getToken, getClass } from '../../validator';
import Header from '../Header';
import UserAvatar from '../../UserAvatar';
import AddMember from './AddMember';

function PageTeam() {
  const { team_id } = useParams();
  const [auth, getAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser ] = useState(getClass(auth, auth.position));
  const [team, setTeam] = useState(null);
  const [team_name, setTeamName] = useState('');
  const [showTeamNameInputs, setShowTeamNameInputs] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [permitted, setPermitted] = useState(true);
  const [course_code, setCourseCode] = useState(null);
  const [section, setSection] = useState(null);


  useEffect(() => {
    async function init () { 
      await renderTeam(); 
    }
    init()
  }, [])

  async function renderTeam () {
    const team_info = await user.getTeamDetails(team_id);
    
    if (team_info.access === 'write') {
      setPermitted(true);

    } else if (team_info.access === 'read') {
      setPermitted(false);
    }
    setTeam(team_info.team_class);
    setTeamName(team_info.team_class.team_name);

    setCourseCode(team_info.course_code);
    setSection(team_info.section);

    document.title = `Team · ${team_info.team_class.team_name}`;
  }


  async function removeMember(uid) {
    const result = confirm('Are you sure you want to remove this student in the team?');

    if (result) {
      await team.removeMember(uid);
      renderTeam();
    }
  }

  async function deleteTeam() {
    const result1 = confirm('Are you sure you want to delete this team?');

    if (result1) {
      const result2 = confirm('Deleting a team is irreversible and its members will lose a team. Are you sure you want to delete this team?');
     
      if (result2) {
        const deleted = await team.deleteTeam();

        if (deleted) {
          window.location.href = '/dashboard';
        }
      }
    }
  }

  async function saveTeamName() {
    if (showTeamNameInputs) {
      const result = await team.updateTeamName(team_name);

      if (result) {
        toast.success('Team name updated.');
        await renderTeam();
      }
    }
    setShowTeamNameInputs(!showTeamNameInputs);
  };

  function showSearch() {    
    const add = document.getElementById('add-member');

    if (!showMemberSearch) {
      setShowMemberSearch(true);
      add.textContent = 'Cancel';
      add.classList.value = 'cancel-btn';
    } else {
      setShowMemberSearch(false);
      add.textContent = 'Add Member';
      add.classList.value = 'create-btn';
    }
  }

  return (
    <>
    {team &&
    (
      <>
        <Header auth={auth} base={'Team'} name={team.team_name} />
        <div id='team-main'> 
          <div id='team-container' className='flex-column'>
            <div id='team-header'>
            <div className='flex-row items-center'>
              {!showTeamNameInputs &&
                <h2>{team.team_name}</h2>
              }
              {showTeamNameInputs &&
                <form>
                  <input 
                    type='text' 
                    className='page-name-input' 
                    value={team_name} 
                    onChange={(e) => setTeamName(e.target.value)} 
                    required/>
                </form>
              }
                <button className='reload-btn items-center' onClick={() => saveTeamName()}>
                    <LuPencilLine size={24} />
                </button>
                <button className='reload-btn items-center' onClick={renderTeam}>
                    <MdLoop size={24} />
                </button>
                </div>
                <div className='two-column-grid'>
                  <label>Course: <b>{course_code}</b></label>
                  <label>Section: <b>{section}</b></label>
                </div>
            </div>
            <div id='team-members-list'>
              <h3>Members</h3>
              <table id='members-table'>
                <tbody>
                {team && team.members.map((member, index) => {
                  return (
                    <tr className='team-member' key={index}>
                      <td className='col-1'>
                        <UserAvatar name={`${member.last_name}, ${member.first_name.charAt(0)}`} size={30}/>
                      </td>
                      <td className='col-2'>
                        <label className='single-line'>{member.last_name}, {member.first_name}</label>
                      </td>
                      <td className='col-3'>
                        {permitted && user.position === 'Professor' &&
                          <button className='remove-btn' onClick={() => {removeMember(member.uid)}}>Remove</button>
                        }
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
              {permitted &&
                <button id='add-member' className='create-btn' onClick={() => {showSearch()}}>Add Member</button>
              }
              {permitted && showMemberSearch &&
                <AddMember team={team} user={user} renderTeam={renderTeam}/>
              }
            </div>
            <div id='team-footer'>
              
              <a href={`/dashboard/${team.class_id}/all`}>&lt; BACK</a>
              {permitted && user.position === 'Professor' &&
                <button id='delete-btn' onClick={deleteTeam}><BsTrash size={20}/><label>Delete Team</label></button>
              }
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}

export default PageTeam
