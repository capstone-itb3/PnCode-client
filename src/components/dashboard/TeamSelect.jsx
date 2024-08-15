import React from 'react'

function TeamSelect({team}) {
  return (
        <div className='team-box flex-column'>
            <div className='team-box-images'>

            </div>
            <label className='name'>{team.team_name}</label>
            <label className='members'>Members: {team.members.length}</label>
        </div>
    )
}

export default TeamSelect