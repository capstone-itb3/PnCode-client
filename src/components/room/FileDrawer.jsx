import React, { useState, useEffect } from 'react'
import { FaHtml5, FaCss3, FaJs } from 'react-icons/fa';
import { BsTrash, BsFileEarmark } from 'react-icons/bs';
function FileDrawer({room, socket, room_files, setRoomFiles, activeFile, displayFile, addNewFile, setAddNewFile}) {
    const [new_file_name, setNewFileName] = useState('');
    const [new_file_type, setNewFileType] = useState('html');
    const [warning, setWarning] = useState(false);

    useEffect(() => {
      socket.on('file_added', ({ file }) => {
        setRoomFiles(prevFiles => [...prevFiles, file]);
      });
    
      return () => {
        socket.off('file_added');
      }
    }, [room_files]);
    
    function addFile(e) {
        e.preventDefault();
        if (room.files.includes(`${new_file_name}.${new_file_type}`)) {
            setWarning(true);
        } else {
            setWarning(false);

            socket.emit('add_file', {
                room_id: room.room_id,
                file_name: new_file_name,
                file_type: new_file_type
            });
            
            setAddNewFile(false);

            return () => {
                socket.off('add_file');

            }
        }
    }

    return (
        <div className='room-top-left'> 
            <div id='file-drawer'>
                {room_files.map((file, index) => {
                    return (
                        <div className={`${file.name === activeFile.name ? 'active-file' : ''} flex-row item`} key={index} >
                            <button 
                                onClick={() => displayFile(file)}
                                className={'items-center name-button'}>
                                { file.type === 'html' && <FaHtml5 size={22}/> }
                                { file.type === 'css' && <FaCss3 size={22}/> }
                                { file.type === 'js' && <FaJs size={22}/> }
                                <label className='single-line'>{file.name}</label>
                            </button>
                        </div>    
                    )})
                }
                {addNewFile &&
                    <form onSubmit={(e) => addFile(e)}>
                        <div className='flex-row file-form'>
                            { new_file_type === 'html' && <FaHtml5 size={22}/> }
                            { new_file_type === 'css' && <FaCss3 size={22}/> }
                            { new_file_type === 'js' && <FaJs size={22}/> }
                            <input  type='text' 
                                    className='file-name-input'
                                    value={new_file_name}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    required/>
                            <select value={new_file_type} onChange={(e) => setNewFileType(e.target.value)}>
                                <option value='html'>. HTML</option>
                                <option value='css'>. CSS</option>
                                <option value='js'>. JS</option>
                            </select>
                        </div>
                        <div className='flex-row file-form-btn'>
                            <input type='submit' value='Add' className='file-add-btn'/>
                            <button className='file-cancel-btn' onClick={() => setAddNewFile(false)}>Cancel</button>
                        </div>
                        {warning && <label className='label-warning'>File already exists</label>}
                    </form>
                }
            </div>
        </div>
    )
}

export default FileDrawer