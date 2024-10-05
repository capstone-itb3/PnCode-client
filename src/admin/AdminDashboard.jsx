import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './admin.css';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import Admin from './AdminClass';
import { toast } from 'react-hot-toast';
import UserAvatar from '../components/UserAvatar';
import logo from '../../assets/logo.jpg';
import TabStudents from './TabStudents';
import TabProfessors from './TabProfessors';
import TabCourses from './TabCourses';
import TabClasses from './TabClasses';
import TabTeams from './TabTeams';
import TabActivities from './TabActivities';
import TabSoloRooms from './TabSoloRooms';
import TabAssignedRooms from './TabAssignedRooms';
import TabFiles from './TabFiles';
import TabAdmins from './TabAdmins';


function AdminDashboard() {
  const [admin, setAdmin] = useState(() => {
    const token = Cookies.get('token');

    if (!token) {
      window.location.href = '/login';
      return null;
    }

    try {
      const user = jwtDecode(token);
      
      if (user?.position === 'Student' || user?.position === 'Professor') {
        window.location.href = '/';
        return null;
      }
      
      return new Admin(user.admin_uid, user.first_name, user.last_name);

    } catch (e) {
      window.location.href = '/login';
      return null;
    }    
  });
  const [showArrows, setShowArrows] = useState(false);
  const [showId, setShowId] = useState(false);


  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { collection, query } = useParams();
  
  const [signOut, setSignOut] = useState(false);
  const signOutRef = useRef(null);

  useEffect(() => {
    try {
      checkForArrows();
      window.addEventListener('resize', checkForArrows);

      const buttons = document.querySelectorAll('.manage-button');
      buttons.forEach(button => {
          button.classList.remove('selected');
      });

      const selected = document.getElementById(`${collection}`);

      selected ? selected.classList.add('selected') : navigate('/admin/dashboard/students');

      return () => window.removeEventListener('resize', checkForArrows);  
    } catch(err) {
        window.location.reload();          
    }
  }, [collection]);

  const checkForArrows = () => {
      if (scrollContainerRef.current) {
          const { scrollWidth, clientWidth } = scrollContainerRef.current;
          setShowArrows(scrollWidth > clientWidth);
      }
  };

  const scroll = (direction) => {
      const container = scrollContainerRef.current;

      if (container) {
          const scrollAmount = direction === 'left' ? -200 : 200;
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  const switchCollection = (collection) => {
    navigate(`/admin/dashboard/${collection}/${query ? query : ''}`);
  }
  
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

    window.location.href = '/admin/login';
  }

  return (
    <div className='admin-dashboard'>
      <header className='admin items-center'>
        <div className='left-nav items-center'>
          <div id='header-url' className='flex-row items-center admin'>
              <img src={logo} alt='logo' />
              <label><span>PnC</span><span>ode</span> Admin</label>
          </div>
        </div>
        <div className='right-nav items-center'>
          <div className='top-profile flex-row items-center'>
            <UserAvatar name={admin.last_name + ', ' + admin.first_name.charAt(0)} size={25}/>
            {admin.last_name}, {admin.first_name}
          </div>
          <button className='items-center' onClick={() => setSignOut(!signOut)}><FiSettings size={24} /></button>
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
      <div id='manages-tab'>
        {showArrows &&
          <button className='scroll-arrow items-center left' onClick={() => scroll('left')}>
            <RiArrowLeftSLine size={20} />
          </button>
        }
        <nav className='manage-scroll' ref={scrollContainerRef}>
          <button id='students' onClick={() => switchCollection('students')} className='manage-button'>Students</button>
          <button id='professors' onClick={() => switchCollection('professors')} className='manage-button'>Professors</button>
          <button id='courses' onClick={() => switchCollection('courses')} className='manage-button'>Courses</button>
          <button id='classes' onClick={() => switchCollection('classes')} className='manage-button'>Classes</button>
          <button id='teams' onClick={() => switchCollection('teams')} className='manage-button'>Teams</button>
          <button id='activities' onClick={() => switchCollection('activities')} className='manage-button'>Activities</button>
          <button id='solo-rooms' onClick={() => switchCollection('solo-rooms')} className='manage-button'>Solo Rooms</button>
          <button id='assigned-rooms' onClick={() => switchCollection('assigned-rooms')} className='manage-button'>Assigned Rooms</button>
          <button id='files' onClick={() => switchCollection('files')} className='manage-button'>Files</button>
          <button id='admins' onClick={() => switchCollection('admins')} className='manage-button'>Admins</button>
        </nav>
        {showArrows &&
          <button className='scroll-arrow items-center right' onClick={() => scroll('right')}>
            <RiArrowRightSLine size={20} />
          </button>
        }
      </div>
      <div id='admin-main'> 
        <div id='manage-content'>
          {collection === 'students' &&
            <TabStudents admin={admin} showId={showId} setShowId={setShowId} />
          }
          {collection === 'professors' &&
            <TabProfessors admin={admin} showId={showId} setShowId={setShowId} />
          }
          {collection === 'courses' &&
            <TabCourses admin={admin} />
          }
          {collection === 'classes' &&
            <TabClasses admin={admin} showId={showId} setShowId={setShowId} />
          }
          {collection === 'teams' &&
            <TabTeams admin={admin} showId={showId} setShowId={setShowId}/>
          }
          {collection === 'activities' && 
            <TabActivities admin={admin} showId={showId} setShowId={setShowId}/>
          }
          {collection === 'solo-rooms' &&
            <TabSoloRooms admin={admin} showId={showId} setShowId={setShowId}/>
          }
          {collection === 'assigned-rooms' && 
            <TabAssignedRooms admin={admin} showId={showId} setShowId={setShowId}/>
          }
          {collection === 'files' &&
            <TabFiles admin={admin} showId={showId} setShowId={setShowId}/>
          }
          {collection === 'admins' &&
            <TabAdmins admin={admin} showId={showId} setShowId={setShowId}/>
          }
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard