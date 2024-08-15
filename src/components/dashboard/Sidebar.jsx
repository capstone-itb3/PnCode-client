import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function Sidebar({ checkParams, position }) {
  const params = useParams();
  const navigate = useNavigate();

  function showSelected( selected ) {
    if (position === 'Student') {
      navigate(`/dashboard/${params.course}/${selected}`);
      
    } else if (position === 'Professor') {
      navigate(`/dashboard/${params.course}/${params.section}/${selected}`);
    }

    checkParams(selected);
  }

  return (
    <aside id='sidebar-main'>
      <label className='sb-filter'>FILTER</label>
      <button className='sb-ops selected' id='sb-all' onClick={() => { showSelected('all') }}>
        <label>All</label>
      </button>
      <button  className='sb-ops' id='sb-teams' onClick={() => { showSelected('teams') }}>
        <label>Teams</label>
      </button>
      {position === 'Student' &&
        <button className='sb-ops' id='sb-assigned' onClick={() => { showSelected('assigned') }}>
          <label>Assigned<span><br/></span>Rooms</label>
        </button>
      }
      {position === 'Professor' &&
        <button className='sb-ops' id='sb-groups' onClick={() => { showSelected('groups') }}>
          <label>Group<span><br/></span>Activities</label>
        </button>
      }
      <button className='sb-ops' id='sb-solo' onClick={() => { showSelected('solo') }}>
        <label>Solo<span><br/></span>Rooms</label>
      </button>
    </aside>
  )
}

export default Sidebar