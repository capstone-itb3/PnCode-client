import React, { useState, useEffect } from 'react'

function History({ file, socket }) {
  const [history, setHistory] = useState(null)
  const [contributions, setContributions] = useState(null)
  const [retrieved, setRetrieved] = useState(true)
  
  useEffect(() => {
    socket.emit('get_history', { 
      file_id: file.file_id,
    });

    socket.on('get_history_result', ({ status, history, contributions }) => {
      if (status === 'ok') {
        setHistory(history);
        setContributions(contributions);

      } else {
        setRetrieved(false)
      }
    });

    socket.on('add_edit_count_result', ({ contributions }) => {
      setContributions(contributions);
      console.log(1);
    });

    return () => {
      socket.off('get_history_result');
      socket.off('add_edit_count_result');
    }
  }, [file]);
  return ( 
    <>
      {retrieved &&
      <div className='flex-column'>
        <div className='history-header'>
          <label className='name'>{file.name}</label>
          {contributions &&
            <>
              <label>Current Edit Count:</label>
              {contributions.length !== 0 && contributions.map((cont, index) => {
                return (
                  <div className='contribution' key={index}>
                    <label>{cont.uid}</label>
                    <label>{cont.edit_count}</label>
                  </div>
                )
              })}
              {contributions.length === 0 &&
                <div className='contribution'>
                  None.
                </div>
              }
            </>
          }
        </div>
        <div id='history-list'>
          {history && history.map((his, index) => {
            // return (
            //   // <div className='history-item' key={index}>
            //   //   <
            //   //   <div className='history-item-left'>
            //   //     <label>{cont.user}</label>
            //   //     <label>{cont.edit_count}</label>
            //   //   </div>
            //   //   <div className='history-item-right'>
            //   //     <label>{cont.t}</label>
            //   //   </div>
            //   // </div>
            // )
          })}
        </div>
      </div>
      }
      {!retrieved &&
        <div className='flex-column'>
          Error retrieving History.
        </div>
      }
    </>
  )
}

export default History