import React, { useState, useEffect } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import convertToReadable from './utils/convertToReadable'

function History({ user, file, socket, rightDisplay }) {
  const [history, setHistory] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [retrieved, setRetrieved] = useState(true);
  const [options, setOptions] = useState('all');
  
  useEffect(() => {
    function getHistory () {
      setHistory(null);
      setContributions(null);
      
      socket.emit('get_history', { 
        file_id: file.file_id,
      });
    }
    getHistory();

    socket.on('get_history_result', ({ status, history, contributions }) => {
      if (status === 'ok') {
        setHistory(history);

        if (user.position === 'Professor') {
          setContributions(contributions);
        }
      } else {
        setRetrieved(false)
      }
    });

    if (user.position === 'Professor') {
      socket.on('add_edit_count_result', ({ contributions }) => {
        setContributions(contributions);
      });
    }
    
    socket.on('reupdate_history', ({ status, file_id, new_history }) => {
      if (status === 'ok' && file.file_id === file_id) { 
        setHistory((prev) => {
          const new_history_list = [new_history, ...prev];
          return new_history_list;
        })
      }
    }); 

    return () => {
      socket.off('get_history_result');
      socket.off('add_edit_count_result');
      socket.off('reupdate_history');
    }
  }, [file]);


  return ( 
    <div id='history-div' className={`${rightDisplay !== 'history' &&  'inactive'}`}>
      <div className='history-container flex-column'>
        {retrieved &&
        <>
          {!history && !contributions &&
            <div className='loading-line'>
                <div></div>
            </div>
          }
          <div className='history-header flex-column'>
            <h4 className={`name ${user?.position === 'Student' && 'student'}`}>{file.name}</h4>
            {user?.position === 'Professor' &&
            <div id='history-buttons' className='flex-row'>
              <button 
                className={`${options === 'all' ? 'active' : ''}`}
                onClick={() => setOptions('all')}>
                  All
              </button>
              <button
                className={`${options === 'history' ? 'active' : ''}`}
                onClick={() => setOptions('history')}>
                  History
              </button>
              <button 
                className={`${options === 'contributions' ? 'active' : ''}`}
                onClick={() => setOptions('contributions')}>
                  Contributions
              </button>
            </div>
            }
            {contributions && options !== 'history' &&
              <div className='contribution-div'>
                <label className='edit-count'>Current Edit Count:</label>
                <div className='contribution-list'>
                  {contributions.length !== 0 && contributions.map((cont, index) => {
                    return (
                      <div className='contribution flex-row' key={cont.uid}>
                        <label className='single-line'>{cont.last_name}, {cont.first_name} </label>
                        :<span>{cont.edit_count}</span>
                      </div>
                    )
                  })}
                </div>
                {contributions.length === 0 &&
                  <div className='contribution'>
                    None.
                  </div>
                }
              </div>
            }
          </div>
          <div id='history-list'>
            {history && history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                              .map((his, index) => {
              return (
                <HistoryItem
                  key={index}
                  index={index}
                  item={his} 
                  contributions={user?.position === 'Professor' ? true : false}
                  file_type={file.type} 
                  options={options}/>
              )
            })}
            {history && history?.length === 0 && user?.position === 'Student' &&
              <div className='length-0'>Code history will appear here as you progress.</div>
            }
            {history && history?.length === 0 && user?.position === 'Professor' &&
              <div className='length-0'>Code history will appear here as students code over time.</div>
            }
          </div>
        </>
        }
        {!retrieved &&
            <label>Error retrieving History.</label>
        }
      </div>
    </div>
  )
}

export default History



function HistoryItem ({ item, file_type, contributions, options, index }) {
  const [createdAt, setCreatedAt] = useState(convertToReadable(new Date(item.createdAt), 'long'));

  useEffect(() => {
    const type = () => {
      if      (file_type === 'html')  return html();
      else if (file_type === 'css')   return css();
      else if (file_type === 'js')    return javascript();;
    }

    const state = EditorState.create({
      doc: item.content,
      extensions: [
        basicSetup,
        type(),
        EditorState.readOnly.of(true),
        EditorView.lineWrapping,
        EditorView.theme({
          '.cm-editor': {
            zIndex: '10 !important',
            pointerEvents: 'none !important'
          }
        })
      ]
    });

    const parent = document.querySelector(`#history-item-${index}`);

    const view = new EditorView({ state: state, parent: parent });


    return () => {
      view.destroy();
    }
  }, []);
  

  return (
    <div className='history-item flex-column'>
      <h4>{createdAt}</h4>
      <div className='body'>
          <div className={`history-content ${options === 'contributions' ? 'hidden' : ''}`}>
            <div id={`history-item-${index}`}  className='history-editor'>
              <div className='cursor-shield'></div>
            </div>
          </div>
          {contributions &&
            <div className={`contribution-div ${options === 'history' ? 'hidden' : ''}`}>
              <label className='edit-count'>Edit Count:</label>
              <div className='contribution-list'>
                {item.contributions.length !== 0 && item.contributions.map((cont, index) => {
                  return (
                    <div className='contribution flex-row' key={cont.uid}>
                      <label className='single-line'>{cont.last_name}, {cont.first_name} </label>
                      :<span>{cont.edit_count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          }
      </div> 
    </div>
  )
}
