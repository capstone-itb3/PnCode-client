import React, { useState, useEffect } from 'react'
import Editor from './Editor'

function EditorTab({room, user, socket, activeFile}) {
  return (
        <div className='editor-container'>
            <div className='file-name-container items-start'>
                <div>
                    {activeFile &&
                        <label>{activeFile.name}</label>
                    }
                </div>
            </div>
            {!activeFile &&
                <div className='loading'>
                    <div className='loading-spinner'/>
                </div>              
            }
            {activeFile &&
                <Editor 
                    room={room}  
                    user={user} 
                    socket={socket} 
                    file={activeFile} 
                />
            }
        </div>
  )
}

export default EditorTab