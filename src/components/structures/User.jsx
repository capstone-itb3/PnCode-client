import React from 'react';
import Avatar from 'react-avatar';

function User({ username, position }) {
  return (
    <section className='user-section'>
      <Avatar name={ username } size='30' round='30px'/>
      <span> { username }</span> {position ? <span> • { position }</span>  : '' }
    </section>
  )
}

export default User