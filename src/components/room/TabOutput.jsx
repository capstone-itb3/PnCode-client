import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImArrowUpRight2 } from 'react-icons/im';

function TabOutput({ outputRef, rightDisplay }) {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [iframeTitle, setIframeTitle] = useState('Output');

  const updateTitle = useCallback(() => {
    if (outputRef.current && outputRef.current.contentDocument) {
      const title = outputRef.current.contentDocument.title;
      if (title && !(/^\s*$/.test(title))) {
        setIframeTitle(title);
      } else {
        setIframeTitle('Output');
      }
    }
  }, [outputRef]);

  useEffect(() => {
    const iframe = outputRef.current;
    if (iframe) {
      iframe.addEventListener('load', updateTitle);
      const intervalId = setInterval(updateTitle, 2000); // Check every second

      return () => {
        iframe.removeEventListener('load', updateTitle);
        clearInterval(intervalId);
      };
    }
  }, [outputRef, updateTitle]);

  function fullView () {
    if (outputRef.current?.src) {
      window.location.href = outputRef.current.src;
    }
  }

  return (
    <div className={`flex-column ${rightDisplay !== 'output' && 'inactive'}`} id='output-div'>
      <div className='output-header items-center'>
          <label className='single-line'><b>{iframeTitle}</b></label>
          <div className='items-center'>
          <a 
            className='output-btn items-center' 
            id='full-btn' 
            onClick={fullView}
            href={outputRef.current?.src ? outputRef.current.src : undefined}
            target='_blank'>
            <ImArrowUpRight2 color={'#505050'} size={17}/>
          </a>
        </div>
      </div>
        <iframe title='Output' id='output-iframe' ref={outputRef} onLoad={updateTitle}>
        </iframe>              
    </div>
  )
}

export default TabOutput
