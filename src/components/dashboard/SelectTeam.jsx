import React from 'react'
import { useNavigate, Link } from 'react-router-dom';
import img from '../../../assets/profile.png'

function SelectTeam({uid, team}) {
    const navigate = useNavigate();
        
    return (
        <Link className='team-box flex-column' to={`/team/${team.team_id}`}>
            {team.members.some(member => member.uid === uid) && 
                <div className='my-team'>My Team</div>
            }
            <div className='team-box-images'>
            {team.members.slice(0,4).map((member, index) => {
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
        </Link>
    )
}

export default SelectTeam
