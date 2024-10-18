import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showConfirmPopup } from '../reactPopupService'

const createdAt = (notif) => {
  const diff = new Date() - new Date(notif.createdAt);
  const timeUnits = [
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)), unit: 'year' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), unit: 'month' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 7)), unit: 'week' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24)), unit: 'day' },
      { value: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), unit: 'hour' },
      { value: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), unit: 'minute' }
  ];

  for (const { value, unit } of timeUnits) {
      if (value > 0) {
          return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
      }
  }
  return 'just now';        
}

function Notifications({ user, notifications }) {
  const [notification, setNotification] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    async function init () {
      const data = await user.getUserNotifications(notifications);
      setNotification(data);
      setLoading(false);
    }
    init();
  }, [notifications]);
  
  async function clickTeamNotif(notif) {
    navigate(`/team/${notif.subject_id}`);

    filterOut(notif.notif_id);
  }  

  async function clickActivityNotif(notif) {
    try {
      if (user.position === 'Student') {
        const room_id = await user.visitActivity(notif.subject_id);

        if (room_id) {
          toast.success('Redirecting you to your team\'s assigned room...');
          navigate(`/room/${room_id}`);

        } else {
          return;
        }
      } else if (user.position === 'Professor') {
        navigate(`/activity/${notif.subject_id}`);
      }

      filterOut(notif.notif_id);
    } catch (e) {
      console.error(e.message)
    }
  }      

  async function clickRoomNotif(notif) {
    navigate(`/room/${notif.subject_id}`);

    filterOut(notif.notif_id);
  }

  async function clickRequestNotif(notif) {
    const confirmed = await showConfirmPopup({
      title: 'Team Invite',
      message: notif.additional,
      confirm_text: 'Accept',
      cancel_text: 'Reject',
    });

    if (confirmed) {
      const res = await user.answerTeamInvite(notif.subject_id, notif.notif_id, true);

      if (res) {
        toast.success('Team invite accepted.');
        navigate(`/team/${notif.subject_id}`);
      }
    } else {
      const res = await user.answerTeamInvite(notif.subject_id, notif.notif_id, false);
      if (res) {
        toast.success('Team invite rejected.');
      }
    }
    filterOut(notif.notif_id);
  }

  async function filterOut(notif_id) {
    setNotification(notification.filter(n => n.notif_id !== notif_id));
    await user.updateNotifications(notif_id);
  }

  return (
    <div id='notifications'>
      <div className='notifications-header'>
          Notifications
      </div>
      <div className='notifications-container'>
        {loading &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
        }
        {!loading && notifications &&
          <>
            {notifications.map((notif, index) => {
              return (
                  <div className='notification-item flex-column' 
                    {...(notif.subject_name === 'team' && { onClick: () => clickTeamNotif(notif) })}
                    {...(notif.subject_name === 'activity' && { onClick: () => clickActivityNotif(notif) })}
                    {...(notif.subject_name === 'room' && { onClick: () => clickRoomNotif(notif) })}
                    {...(notif.subject_name === 'request' && { onClick: () => clickRequestNotif(notif) })}
                    key={index}>
                    <div className='content'>
                      {notif.message}
                    </div>
                    <div>
                      {createdAt(notif)}
                    </div>
                  </div>
              )
            })}
          </>
        }
      </div>
    </div>
  )
}

export default Notifications