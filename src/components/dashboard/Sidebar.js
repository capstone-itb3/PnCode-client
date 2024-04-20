import React from 'react'

function Sidebar() {
  return (
    <aside className='sidebar-main'>
        <label>DASHBOARD</label>
        <a href='/dashboard'>Rooms</a>
        <a href='/dashboard/teams'>Teams</a> 
        <a href='/dashboard/classes'>Classes</a>

        <label>USER</label>
        <a href='/profile'>Profile</a>
        <a href='/settings'>Settings</a> 
    </aside>
  )
}

export default Sidebar