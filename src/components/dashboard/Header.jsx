import React from 'react'
import { FiBell, FiList } from 'react-icons/fi';

function Header({auth}) {
  
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
        <button id='sidebar-toggler' onClick={ toggleSidebar }><FiList size={30} color={'white'}/></button>
        <a href='/' id='company-logo'>PnCode</a>
        <div className='top-profile'>
            {auth.first_name} {auth.last_name} • {auth.position}
        </div>
      </nav>
      <nav className='right-nav'>
        <button><FiBell size={24} /></button>
      </nav>
    </header>
  )
}

export default Header