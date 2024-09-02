import React, { useState, useEffect } from 'react'
import Editor from './Editor'

function EditorTab({room, user, cursorColor,socket, activeFile, editorUsers, setEditorUsers}) {
  return (
        <div className='editor-container'>
            {!activeFile &&
                <div className='loading'>
                    <div className='loading-spinner'/>
                </div>              
            }

            {activeFile &&
            <>
                <div className='file-name-container items-start'>
                    <div>
                        {activeFile &&
                            <label>{activeFile.name}</label>
                        }
                    </div>
                </div>
                <Editor 
                    room={room}  
                    user={user} 
                    cursorColor={cursorColor}
                    socket={socket} 
                    file={activeFile} 
                    editorUsers={editorUsers}
                    setEditorUsers={setEditorUsers}/>
            </>
            }
        </div>
  )
}

export default EditorTab