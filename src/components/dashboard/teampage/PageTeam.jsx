import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { BsTrash, BsPlus } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { getToken, getClass } from '../../validator';
import Header from '../Header';
import UserAvatar from '../../UserAvatar';
import AddMember from './AddMember';

function PageTeam() {
  const { team_id } = useParams();
  const [auth, getAuth] = useState(getToken(Cookies.get('token')));
  const [user, setUser ] = useState(getClass(auth, auth.position));
  const [team, setTeam] = useState(null);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [permitted, setPermitted] = useState(true);

  useEffect(() => {
    async function init () { 
      await renderTeam(); 
    }
    init()
  }, [])

  async function renderTeam () {
    try {
      const team_info = await user.getTeamDetails(auth, team_id)
      
      if (team_info.access === 'write') {
        setPermitted(true);

      } else if (team_info.access === 'read') {
        setPermitted(false);
      
      } else if (!team_info.access) {
        window.location.href = '/dashboard';
      }

      setTeam(team_info.team_class);

    } catch(e) {
      console.log(e);
      window.location.href = '/dashboard';
    }
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
        <Header auth={auth}/>
        <div id='team-main'> 
          <div id='team-container' className='flex-column'>
            <div id='team-header'>
              <h2>{team.team_name}</h2>
              <div className='two-column-grid'>
                <label>Course: <b>{team.course}</b></label>
                <label>Section: <b>{team.section}</b></label>
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
                        <button className='remove-member' onClick={() => {removeMember(member.uid)}}>Remove</button>
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
              <a href='/dashboard'>&lt; BACK</a>
              {permitted &&
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
