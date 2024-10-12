import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { MdKeyboardBackspace } from "react-icons/md";
import './admin.css';
import Admin from './AdminClass';
import Header from './Header';
import ManageTabs from './ManageTabs';
import TabStudents from './tabs/TabStudents';
import TabProfessors from './tabs/TabProfessors';
import TabCourses from './tabs/TabCourses';
import TabClasses from './tabs/TabClasses';
import TabTeams from './tabs/TabTeams';
import TabActivities from './tabs/TabActivities';
import TabSoloRooms from './tabs/TabSoloRooms';
import TabAssignedRooms from './tabs/TabAssignedRooms';
import TabFiles from './tabs/TabFiles';


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
  const [showId, setShowId] = useState(false);
  const { collection } = useParams();
  const navigate = useNavigate();

  function rowDate(date) {
    date = new Date(date);

    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = ((date.getHours() % 12) || 12) < 10 ? '0' + ((date.getHours() % 12) || 12) : ((date.getHours() % 12) || 12);
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = date.getHours() < 12 ? 'AM' : 'PM';
    return `${day}, ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }
  
  return (
    <div className='admin-dashboard'>
      <Header admin={admin}/>
        <ManageTabs collection={collection}/>
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
          <TabAssignedRooms admin={admin} showId={showId} setShowId={setShowId} rowDate={rowDate}/>
        }
        {collection === 'files' &&
          <TabFiles admin={admin} showId={showId} setShowId={setShowId}/>
        }
        {/* <footer>
            <button className='items-center' onClick={() => navigate(-1)}><MdKeyboardBackspace size={20}/> BACK</button>
        </footer> */}
      </div>
  )
}

export default AdminDashboard