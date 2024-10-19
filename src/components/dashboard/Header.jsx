import React, { useState, useEffect, useRef } from 'react'
import { FiBell, FiLogOut } from 'react-icons/fi';
import UserAvatar from '../UserAvatar';
import Cookies from 'js-cookie';
import logo from '../../../assets/logo.jpg'
import Notifications from './Notifications';

function Header({ user, base, name }) {
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const settingsRef = useRef(null);
  const notifsRef = useRef(null);


  useEffect(() => {
    async function getNotifications() {
      const data = await user.getUserNotifications(notifications);
        setNotifications(data);
        console.log(data);
    }
    getNotifications();
  }, [])

  
  useEffect(() => {  
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);

      }
      if (notifsRef.current && !notifsRef.current.contains(event.target)) {
        setShowNotifs(false);
      }      
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef, notifsRef]);

  function signOutUser() {
    Cookies.remove('token');

    if (user.position === 'Professor') {
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
          <UserAvatar name={`${user.last_name.charAt(0)} ${user.first_name.charAt(0)}`} size={25}/>
          <label>{user.last_name}, {user.first_name}</label>
        </div>
        <div ref={notifsRef}>
          <button id='notif-bell' className='btn-icons items-center' onClick={() => setShowNotifs(!showNotifs)}>
            <FiBell size={24} />
          </button>
          {showNotifs &&
            <Notifications user={user} notifications={notifications} setNotifications={setNotifications} />
          }
        </div>
        <div ref={settingsRef}>
          <button className='btn-icons items-center' onClick={() => setShowSettings(!showSettings)}>
            <FiLogOut size={24} />
          </button>
          {showSettings &&
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
