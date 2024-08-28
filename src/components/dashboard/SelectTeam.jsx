import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function SelectTeam({uid, team}) {
    const navigate = useNavigate();
    
    const imageDisplay = () => {
        return team.members.slice(0, 5).map((member, index) => {
            const image = member.image || '/profile.png';
            return (
                <img 
                    key={index}
                    className='team-image' 
                    src={image} 
                    alt={member.first_name} 
                />
            );
        });
    };
    
    const isIncluded = (() => {
        return team.members.some(member => member.uid === uid);
    });


    function goToTeamPage () {
        navigate(`/team/${team.team_id}`);
    }

    return (
        <div className='team-box flex-column' onClick={goToTeamPage}>
            {isIncluded() && <div className='your-team'>Your Team</div>}
            <div className='team-box-images'>
                {imageDisplay()}
            </div>
            <label className='name'>{team.team_name}</label>
            <label className='members'>Members: {team.members.length}</label>
        </div>
    )
}

export default SelectTeam
