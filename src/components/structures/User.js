import React from 'react';
import Avatar from 'react-avatar';

function User({ username }) {
  return (
    <section className='user-section'>
      <Avatar name={ username.toString() } size='30' round='30px'/>
      <span> { username.toString() }</span>
    </section>
  )
}

export default User