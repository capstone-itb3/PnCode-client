import React, { useState, useEffect, useRef } from 'react'
import { BsXCircleFill } from 'react-icons/bs';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useParams } from 'react-router-dom';

function Console({rightDisplay, name, socket, socketId, consoleOpen, setConsoleOpen}) {
  const [logs, setLogs] = useState([]);
  const [showShared, setShowShared] = useState(true);
  const logsRef = useRef(null);
  const { room_id } = useParams();
  const [filteredLogs, setFilteredLogs] = useState(logs);


  useEffect(() => {
    function handleMessage(event) {
      if (event.data && event.data.type === 'console') {
        const timestamp = new Date().toLocaleTimeString();
        const log = {
            time: timestamp,
            type: event.data.logType || 'log',
            message: event.data.message,
            logger: 1
        }
        
        setLogs(prev => [...prev, log]);

        if (name !== '' && socket) {
            socket.emit('share_log', {
                room_id,
                log,
                name,
            });
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('message', handleMessage);
    }
  }, [socket]);

  useEffect(() => {
    socket.on('add_shared_log', ({new_log, socket_id}) => {
        if (new_log.logger === name && socket_id === socketId ) {
            return;
        }

        setLogs(prev => [...prev, new_log]);
    })

    return () => {
        socket.off('add_shared_log');
    }
  }, [socketId, room_id])

  useEffect(() => {
    setFilteredLogs(!showShared ? logs.filter(log => log.logger === 1) : logs)
  }, [logs, showShared]);

  useEffect(() => {
    if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }  
  }, [filteredLogs])

  return (
    <div className={`flex-column ${rightDisplay !== 'output' && 'inactive'} ${!consoleOpen && 'closed'}`} id='console-div'>
        <div className="console-header items-center">
        <span>Console</span>
        <div className="items-center">
            <label className='shared-console items-center'>
                <input 
                        type="checkbox" 
                        checked={showShared}
                        onChange={(e) => setShowShared(e.target.checked)}
                        style={{marginRight: '5px'}}
                />
                Show Shared
            </label>
            <button className='clear-console' onClick={() => setLogs([])}>Clear</button>
            <RiArrowDropDownLine size={20} onClick={() => setConsoleOpen(!consoleOpen)} className={`show-console ${!consoleOpen && 'closed'}`}/>
        </div>
    </div>
    {consoleOpen && (
        <div className='console-container'  ref={logsRef}>
            <div className="console-logs flex-column">
                {filteredLogs.map((log, index) => (
                <div key={index} className={`console-log ${log.type} items-start`}>
                    <div className="timestamp">{log.time}</div>
                    <div className="message">
                        {log.type === 'error' && <BsXCircleFill size={10} color={'red'} className='log-icon'/>}
                        {log.type === 'warn' && <BsExclamationTriangleFill size={10} color={'orange'} className='log-icon'/>}
                        {log.message}
                        {showShared && <span>·{log.logger === 1 ? 'You' : log.logger }</span>}
                    </div>
                </div>
                ))}
            </div>
        </div>
    )}
    </div>
  )
}

export default Console
