import React from 'react'
import { FiCircle, FiSettings } from 'react-icons/fi';
import User from '../structures/User';

function Header({auth}) {

    return (
    <header>
      <nav className='left-nav'>
      <a href='/' className='company-logo'>codlin</a>
        <a href='/dashboard'>DASHBOARD</a>
        <a href='#'>CREATE</a>
        <a href='#'>JOIN</a>
      </nav>
      <nav className='right-nav'>
        <a href='/settings'><FiSettings size={24} color={'#777'}/></a>
        <a href='/dashboard'><User username={auth.username}/></a>
      </nav>
    </header>
  )
}

export default Header