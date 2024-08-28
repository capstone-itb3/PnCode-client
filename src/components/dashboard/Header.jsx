import React from 'react'
import { FiBell, FiList } from 'react-icons/fi';
import UserAvatar from '../UserAvatar';

function Header({auth}) {
  const shortened_name = auth.last_name + ', ' + auth.first_name.charAt(0);

  let visible = 0;
  function toggleSidebar() {
      let sidebar = document.getElementById('sidebar-main');
      let toggler = document.getElementById('sidebar-toggler');
      let logo = document.getElementById('company-logo');

      if (visible % 2 === 0) {
          sidebar.style.left = 0;
          toggler.firstChild.style.color = '#808080';
          logo.style.color = '#808080';

      } else {
          sidebar.style.left = '-224px';
          toggler.firstChild.style.color = '#ffffff';
          logo.style.color = '#ffffff';
      }

      visible++;
  }

  return (
    <header>
      <nav className='left-nav'>
        <a href='/' id='company-logo'>PnCode</a>
        <div className='flex-row top-profile'>
            <UserAvatar name={shortened_name} size={25}/>
            <label>{auth.last_name}, {auth.first_name}<span>•</span>{auth.position}</label>
        </div>
      </nav>
      <nav className='right-nav'>
        <button><FiBell size={24} /></button>
      </nav>
    </header>
  )
}

export default Header