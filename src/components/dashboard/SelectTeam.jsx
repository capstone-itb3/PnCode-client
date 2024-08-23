import React, { useState } from 'react'
// import ViewTeam from './ViewTeam';

function SelectTeam({uid, team}) {
    const [showViewTeam, setShowViewTeam] = useState(false);
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
        for (let i = 0; i < team.members.length; i++) {
            if (uid !== undefined && team.members[i].uid === uid) {
                return true
            };
        }
        return false;
    });

    return (
        <div className='team-box flex-column' onClick={() => setShowViewTeam(true)}>
            {isIncluded() ?  
            <div className='your-team'>Your Team</div> 
            : null}
            <div className='team-box-images'>
                {imageDisplay()}
            </div>
            <label className='name'>{team.team_name}</label>
            <label className='members'>Members: {team.members.length}</label>
            {showViewTeam && 
            <ViewTeam team={team} uid={uid} isIncluded={isIncluded()}/>}
            
        </div>
    )
}

export default SelectTeam