import React, { useState, useEffect } from 'react'
import { BsExclamationTriangleFill } from 'react-icons/bs'
import Editor from './Editor'

function EditorTab({room, user, cursorColor,socket, activeFile, editorUsers, setEditorUsers}) {
    const [warning, setWarning] = useState(0);
    const [saved, setSaved] = useState(null);


  return (
        <div className='editor-container flex-column'>
            {!activeFile &&
                <div className='loading'>
                    <div className='loading-spinner'/>
                </div>              
            }

            {activeFile &&
            <>
                <div className='file-name-container items-start'>
                    <div id='file-name'>
                        {activeFile &&
                            <label>{activeFile.name}</label>
                        }
                    </div>
                    {warning === 1 &&
                    <div id='file-warning'>
                            <label className='single-line items-center'>
                                <BsExclamationTriangleFill size={12}/>
                                <span>Empty documents will not be saved to prevent loss of progress.</span>
                            </label>
                    </div>
                    }
                    {warning === 0 &&
                    <div id='save-status' className='items-center'>
                        {saved}
                    </div>
                    }
                </div>
                <Editor 
                    room={room}  
                    user={user} 
                    cursorColor={cursorColor}
                    socket={socket} 
                    file={activeFile}
                    setSaved={setSaved}
                    editorUsers={editorUsers}
                    setEditorUsers={setEditorUsers}
                    setWarning={setWarning}/>
            </>
            }
        </div>
  )
}

export default EditorTab