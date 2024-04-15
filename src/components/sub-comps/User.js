import React from 'react';
import Avatar from 'react-avatar';

function User({ username }) {
  return (
    <div>
      <Avatar name={ username.toString() } size='30' round='30px'/>
      <span>{ username.toString() }</span>
    </div>
  )
}

export default User