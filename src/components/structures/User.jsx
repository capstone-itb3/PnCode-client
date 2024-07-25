import React from 'react';
import Avatar from 'react-avatar';

function User({ joiner }) {
  return (
    <section className='user-section'>
      <Avatar name={ joiner } size='30' round='30px'/>
      <span> { joiner }</span>
    </section>
  )
}

export default User