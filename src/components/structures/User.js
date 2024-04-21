import React from 'react';
import Avatar from 'react-avatar';

function User({ username }) {
  return (
    <section className='user-section'>
      <Avatar name={ username } size='30' round='30px'/>
      <span> { username }</span>
    </section>
  )
}

export default User