import React from 'react';
import Avatar from 'react-avatar';

function UserAvatar({ name, size }) {

  return (
    <div className='avatar'>
      <Avatar name={name} size={size} round='30px'/>
    </div>
  )
}

export default UserAvatar