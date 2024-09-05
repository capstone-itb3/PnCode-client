import React, { useState, useEffect } from 'react';
import { RxSewingPinFilled } from 'react-icons/rx';

function Members({ members, roomUsers}) {
  const [displayMembers, setDisplayMembers] = useState(null);

  useEffect(() => {
    setDisplayMembers(() => { 
      return members.map((member, index) => {
          const user = roomUsers.find(user => user.user_id === member.uid);
          return (
            <section className='items-center user-section' key={member.uid}>
              <div className='user-pin'>
              {user &&
                <RxSewingPinFilled size={20} color={`${user.cursor.color}`}/>
              }
              </div>
              <span className={`${user ? '': 'inactive' } single-line`}> 
                {`${member.last_name}, ${member.first_name}`}
              </span>
            </section>
          )})
  });
  }, [roomUsers]);

  return (
    <div className='side-tab'>
      <h5>Members</h5>
      <div className='flex-column'>
        {displayMembers}
      </div>
    </div>
  )
}

export default Members