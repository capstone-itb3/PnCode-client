import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { BsChevronLeft } from 'react-icons/bs';

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

  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.getElementById('sidebar-main');
      sidebar.style.left = window.innerWidth < 800 ? '-149px' : '0px';
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  function hideSidebar() {
    document.getElementById('sidebar-main').style.left = '-149px';
  }

  return (
    <aside id='sidebar-main' className='flex-column'>
      <button id='sb-remove' onClick={hideSidebar}><BsChevronLeft size={ 25 }/></button>
      <label className='sb-filter'>FILTER</label>
      <button className='sb-ops selected' id='sb-all' onClick={() => { showSelected('all') }}>
        <label>All</label>
      </button>
      <button className='sb-ops' id='sb-teams' onClick={() => { showSelected('teams') }}>
        <label>Teams</label>
      </button>
      <button className='sb-ops' id='sb-activities' onClick={() => { showSelected('activities') }}>
        <label>Group<span><br/></span>Activities</label>
      </button>
      <button className='sb-ops' id='sb-solo' onClick={() => { showSelected('solo') }}>
        <label>Solo<span><br/></span>Rooms</label>
      </button>
    </aside>
  )
}

export default Sidebar