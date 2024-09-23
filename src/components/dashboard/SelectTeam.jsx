import React from 'react'
import { useNavigate } from 'react-router-dom';
import img from '../../../profile.png'

function SelectTeam({uid, team}) {
    const navigate = useNavigate();
        
    return (
        <div className='team-box flex-column' onClick={() => navigate(`/team/${team.team_id}`)}>
            {team.members.some(member => member.uid === uid) && 
                <div className='my-team'>My Team</div>
            }
            <div className='team-box-images'>
            {team.members.slice(0, 5).map((member, index) => {
                return (
                    <img 
                        key={index}
                        className='team-image' 
                        src={img} 
                        alt={member.first_name} 
                    />
                );
            })}
            </div>
            <label className='name'>{team.team_name}</label>
            <label className='members'>Members: {team.members.length}</label>
        </div>
    )
}

export default SelectTeam
