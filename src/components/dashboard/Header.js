import React from 'react'
import { FiCircle, FiSettings } from 'react-icons/fi';

function Header() {

    return (
    <header>
      <nav className='left-nav'>
      <a href='/' className='company-logo'>CodLin</a>
        <a href='/dashboard'>DASHBOARD</a>
        <a href='/create'>CREATE</a>
        <a href='/join-room'>JOIN</a>
      </nav>
      <nav className='right-nav'>
        <a href='/settings'><FiSettings size={24} color={'#777'}/></a>
        <a href='/dashboard'><FiCircle  size={36} color={'#777'}/></a>
      </nav>
    </header>
  )
}

export default Header