import React, { useState, useEffect } from 'react'
import { BsExclamationTriangleFill } from 'react-icons/bs'
import Editor from './Editor'

function EditorTab({room, user, cursorColor, socket, open_time, close_time, activeFile, editorUsers, setEditorUsers, editorTheme}) {
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
                    {activeFile && warning === 1 &&
                    <div id='file-warning'>
                            <label className='single-line items-center'>
                                <BsExclamationTriangleFill size={12}/>
                                <span>Empty documents will not be saved to prevent loss of progress.</span>
                            </label>
                    </div>
                    }
                    {activeFile && warning === 2 &&
                    <div id='file-warning'>
                            <label className='single-line items-center'>
                                <BsExclamationTriangleFill size={12}/>
                                <span>The access for this activity is currently closed.</span>
                            </label>
                    </div>
                    }
                    {activeFile && warning === 0 &&
                    <div id='save-status' className='items-center'>
                        {saved}
                    </div>
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
                    editorUsers={editorUsers}
                    setEditorUsers={setEditorUsers}
                    editorTheme={editorTheme}
                    setWarning={setWarning}/>
                }
            </>
        </div>
  )
}

export default EditorTab