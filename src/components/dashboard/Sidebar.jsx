import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function Sidebar() {
  const { select } = useParams();

  useEffect(() => {
    if (select === 'teams') {
      document.getElementById('sb-2').classList.add('sb-selected');
    } else if (select === 'classes') {
      document.getElementById('sb-3').classList.add('sb-selected');
    } else {
      document.getElementById('sb-1').classList.add('sb-selected');
    }
  })
  
  return (
    <aside className='sidebar-main'>
      <div className='list-group'>
        <label>DASHBOARD</label>
        <a id='sb-1' href='/dashboard'>Rooms</a>
        <a id='sb-2' href='/dashboard/teams'>Teams</a> 
        <a id='sb-3'href='/dashboard/classes'>Classes</a>
      </div>
      <div className='list-group'>      
        <label>USER</label>
        <a id='sb-4' href='#'>Profile</a>
        <a id='sb-5' href='#'>Settings</a> 
      </div>
      <div className='list-group'>      
        <label>ABOUT</label>
        <a id='sb-8' href='#'>About Us</a>
        <a id='sb-9' href='#'>Feedback</a> 
      </div>
    </aside>
  )
}

export default Sidebar