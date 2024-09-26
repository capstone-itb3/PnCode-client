import React from 'react'

function Notifications({ user, notifications }) {
    const [notification, setNotification] = useState(notifications);
    const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div id='notifications'>
        <div className='notifications-header'>
            Notifications
        </div>
        <div className='notifications-container'>
        </div>
        <div className='notifications-footer'>
        </div>                
    </div>
  )
}

export default Notifications