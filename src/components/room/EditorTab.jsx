import React from 'react'
import Editor from './Editor'
import TabOutput from './TabOutput';

function EditorTab({room, user, socket, activeFile, addToActiveMembers}) {
  return (
    <div id='editor-tab'>
        <div className='editor-section flex-row'>
            <div className='editor-container'>
                <div className='file-name-container items-start'>
                    <div>
                        <label>{activeFile}</label>
                    </div>
                </div>
                <Editor 
                    room={room}  
                    user={user} 
                    socket={socket} 
                    file={activeFile} 
                    addToActiveMembers={addToActiveMembers}/>
            </div>
            <TabOutput />        
        </div>
    </div>
  )
}

export default EditorTab