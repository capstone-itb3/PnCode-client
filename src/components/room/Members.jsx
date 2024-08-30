import React from 'react';
import UserAvatar from '../UserAvatar'

function Members({ members, activeMembers }) {
  console.log(members);
  return (
    <div className='left-side-tab'>
    <h5>Members</h5>
    <div className='flex-column'>
      {members.map((member, index) => {
        return (
        <section className='items-center user-section' key={member.uid}>
          <UserAvatar 
                      name={`${member.last_name}, ${member.first_name.charAt(0)}`} 
                      size={20}/>
          <span> 
            {`${member.last_name}, ${member.first_name}`}
          </span>
          {activeMembers.includes(member.uid) ?
            <label className='active-label'>Active</label> 
            : null
          }
        </section>  
        )})        
      }
    </div>
  </div>
  )
}

export default Members