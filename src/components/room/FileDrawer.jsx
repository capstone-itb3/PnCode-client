import React from 'react'
import { BsFiletypeHtml, BsFiletypeCss, BsFiletypeJs, BsTrash } from 'react-icons/bs';

function FileDrawer({room, activeFile, setActiveFile}) {

  return (
    <div id='file-drawer'>
        {room.files.map((file, index) => {
            let file_type = '';
            if (file.slice(-5) === '.html') {
                file_type = 'html';
            } else if (file.slice(-4) === '.css') {
                file_type = 'css';
            } else if (file.slice(-3) === '.js') {
                file_type = 'js';
            }
            return (
                <div className={`${file === activeFile ? 'active-file' : ''} flex-row item`} key={index}>
                    <button
                        className={'items-center name-button'}
                        onClick={() => setActiveFile(file)}>
                        { file_type === 'html' && <BsFiletypeHtml size={22}/> }
                        { file_type === 'css' && <BsFiletypeCss size={22}/> }
                        { file_type === 'js' && <BsFiletypeJs size={22}/> }
                        <label>{file}</label>
                    </button>
                    <button className='delete-file items-center' ><BsTrash size={18}/></button>                    
                </div>    
            )})
        }
        {/* <div className='add-file item items-center'>
            <button className='name-button'>
                <label>Add File</label>
            </button>
        </div> */}
    </div>
  )
}

export default FileDrawer