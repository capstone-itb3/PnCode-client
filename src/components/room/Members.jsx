import React, { useState, useEffect, useRef } from 'react';
import { RxSewingPinFilled } from 'react-icons/rx';

function Members({ members, roomUsers, inSolo }) {
  const [displayMembers, setDisplayMembers] = useState(null);
  const onlineCountRef = useRef(0);
  
  useEffect(() => {
    if (roomUsers && members) {
      onlineCountRef.current = 0;

      setDisplayMembers(() => {
        return members.map((member, index) => {
          const online = roomUsers.find(user => user.user_id === member.uid);
          online ? onlineCountRef.current++ : null;

          return (
            <section className='items-center user-section' key={member.uid}>
              <div className='user-pin'>
              {online &&
                <RxSewingPinFilled size={20} color={`${online.cursor.color}`}/>
              }
              </div>
              <span className={`${online ? '': 'inactive' } single-line`}> 
                {`${member.last_name}, ${member.first_name}`}
              </span>
            </section>
          )
        });
      });
    } else {
      setDisplayMembers(null);
    }
  }, [members, roomUsers]);

  return (
    <div className='side-tab flex-column'>
      <div className='room-member-header flex-row'>
        <h5>Members</h5> 
        {!inSolo &&
          <span className={`${onlineCountRef.current !== 0 && 'active'}`}>• {onlineCountRef.current} Online</span> 
        }
      </div>
      <div id='members-div' className='flex-column'>
        {displayMembers}
        {!members &&
            <section className='items-center user-section length-0'>
              The team owning this room has been deleted.
            </section>
        }
      </div>
    </div>
  )
}

export default Members