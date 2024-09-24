import React, { useState, useEffect, useRef } from 'react'
import { FiBell, FiLogOut } from 'react-icons/fi';
import UserAvatar from '../UserAvatar';
import Cookies from 'js-cookie';
import logo from '../../../public/logo.jpg'

function Header({ auth, base, name }) {
  const [signOut, setSignOut] = useState(false);
  const signOutRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (signOutRef.current && !signOutRef.current.contains(event.target)) {
        setSignOut(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [signOutRef]);

  function signOutUser() {
    Cookies.remove('token');

    if (auth.position === 'Professor') {
      window.location.href = '/login/professor';
    } else {
      window.location.href = '/login';
    }
  }

  return (
    <header>
      <div className='left-nav items-center'>
        <div id='header-url' className='flex-row items-center'>
            <img src={logo} alt='logo' />
            <label className='single-line'><span>{base}</span> / <a href=''>{name}</a> </label>
        </div>
      </div>
      <div className='right-nav items-center'>
        <div className='flex-row top-profile items-center'>
          <UserAvatar name={auth.last_name + ', ' + auth.first_name.charAt(0)} size={25}/>
          <label>{auth.last_name}, {auth.first_name}</label>
        </div>
        <button id='notif-bell' className='items-center'><FiBell size={24} /></button>
        <div ref={signOutRef}>
          <button className='items-center' onClick={() => setSignOut(!signOut)}><FiLogOut size={24} /></button>
          {signOut &&
            <button id='signout-btn' onClick={signOutUser}>
              Sign Out
            </button>
          }
        </div>
      </div>
    </header>
  )
}

export default Header
