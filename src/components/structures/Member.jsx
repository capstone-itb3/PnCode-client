import React from 'react';
import Avatar from 'react-avatar';

function Member({ joiner }) {
  return (
    <section className='user-section'>
      <Avatar name={ joiner } size='30' round='30px'/>
      <span> { joiner }</span>
    </section>
  )
}

export default Member