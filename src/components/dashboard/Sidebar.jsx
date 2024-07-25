import React, { useEffect } from 'react'

function Sidebar({checkParams}) {

  function showSelected( selected ) {
    window.history.replaceState(null, null, `/dashboard/${selected}`);
    checkParams(selected);
  }

  return (
    <aside id='sidebar-main'>
      <button className='sb-ops selected' id='sb-all' onClick={() => { showSelected('all') }}>
        <label>All</label>
      </button>
      <button  className='sb-ops' id='sb-teams' onClick={() => { showSelected('teams') }}>
        <label>Teams</label>
      </button>
      <button className='sb-ops' id='sb-assigned' onClick={() => { showSelected('assigned') }}>
        <label>Assigned<span><br/></span>Rooms</label>
      </button>
      <button className='sb-ops' id='sb-solo' onClick={() => { showSelected('solo') }}>
        <label>Solo<span><br/></span>Rooms</label>
      </button>
    </aside>
  )
}

export default Sidebar