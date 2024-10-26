import React, { useState, useEffect } from 'react'
import { BsExclamationTriangleFill } from 'react-icons/bs'
import Editor from './Editor'

function EditorTab({room, user, cursorColor, socket, open_time, close_time, activeFile, editorTheme}) {
    const [warning, setWarning] = useState(0);
    const [saved, setSaved] = useState(null);


  return (
    <div id='editor-container' className={`flex-column  ${editorTheme !== 'dark' && 'light'}`}>
        <>
            <div className='file-name-container items-start'>
                <div id='file-name'>
                    {activeFile &&
                        <label>{activeFile.name}</label>
                    } 
                    {!activeFile &&
                        <label>No file selected.</label>
                    }
                </div>
                {activeFile &&
                <>
                    {warning === 0 &&
                    <div id='save-status' className='items-center'>
                        {saved}
                    </div>
                    }
                    {warning > 0 &&
                        <div id='file-warning'>
                            <label className='single-line items-center'>
                                <BsExclamationTriangleFill size={12}/>
                                {warning === 1 &&
                                    <span>Empty documents will not be saved to prevent loss of progress.</span>
                                }
                                {warning === 2 &&
                                    <span>The access for this activity is currently closed.</span>
                                }
                                {warning === 3 &&
                                    <span>You cannot edit the same line with another user</span>
                                }
                                {warning === 4 &&
                                    <span>Connection to websocket has failed. Please refresh the page.</span>
                                }
                            </label>
                        </div>
                    }
                </>
                }
            </div>
            {activeFile &&
            <Editor 
                room={room}  
                user={user} 
                cursorColor={cursorColor}
                socket={socket} 
                open_time={open_time}
                close_time={close_time}
                file={activeFile}
                setSaved={setSaved}
                editorTheme={editorTheme}
                warning={warning}
                setWarning={setWarning}/>
            }
        </>
    </div>
  )
}

export default EditorTab