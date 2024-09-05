import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImArrowUpRight2 } from 'react-icons/im';
import { FaRegWindowMinimize } from 'react-icons/fa';

function TabOutput({ outputRef, outputLabel }) {
  const navigate = useNavigate();

  function fullView () {
    if (outputRef.current?.src) {
      window.location.href = outputRef.current.src;
    }
  }

  return (
    <div className='flex-column' id='output-div'>
      <div className='output-header'>
          <label className='single-line'>{outputLabel}</label>
          <div className='items-center'>
            <button 
              className='output-btn items-center' 
              id='full-btn' 
              onClick={ fullView }>
              <ImArrowUpRight2 color={'#505050'}size={17}/>
            </button>
          </div>
      </div>
        <iframe title= 'Displays Output' id='output-iframe' ref={outputRef}>
        </iframe>              
    </div>
  )
}

export default TabOutput