import React, { useState } from 'react'
import { FiBell } from 'react-icons/fi';
import UserAvatar from '../UserAvatar';

function Header({ auth, base, name }) {

  return (
    <header>
      <div className='left-nav'>
        <div id='header-url' className='flex-row'>
            <label className='single-line'><span>{base}</span> / <a href=''>{ name }</a> </label>
        </div>
      </div>
      <div className='right-nav items-center'>
        <div className='flex-row top-profile items-center'>
          <UserAvatar name={auth.last_name + ', ' + auth.first_name.charAt(0)} size={25}/>
          <label>{auth.last_name}, {auth.first_name}</label>
        </div>
        <button id='notif-bell' className='items-center'><FiBell size={24} /></button>
      </div>
    </header>
  )
}

export default Header