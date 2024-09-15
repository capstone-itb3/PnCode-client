import React, { useState, useEffect } from 'react'
import { FaHtml5, FaCss3, FaJs } from 'react-icons/fa';
import { BsTrash } from 'react-icons/bs';
function FileDrawer({room, user, socket, room_files, setRoomFiles, activeFile, displayFile, addNewFile, setAddNewFile, deleteFile, setDeleteFile}) {
    const [new_file_name, setNewFileName] = useState('');
    const [new_file_type, setNewFileType] = useState('html');
    const [warning, setWarning] = useState(null);

    useEffect(() => {
      socket.on('file_added', ({ status, file, message }) => {
        if (status === 'ok') {
            setWarning(null);
            setAddNewFile(false);
            setNewFileName('');

            setRoomFiles(prevFiles => [...prevFiles, file]);
        } else {
            setWarning(message);
        }
      });

      socket.on('file_deleted', ({ status, file_id, message }) => {
        if (status === 'ok') {
            setWarning(null);
            setDeleteFile(false);

            let files = room_files.filter(file => file.file_id !== file_id);
            setRoomFiles(prevFiles => prevFiles.filter(file => file.file_id !== file_id));

            if (files.length !== 0) {
                displayFile(files[0]);
            } else {
                displayFile(null);
            }
        } else {
            setWarning(message);
        }
      });
    
      return () => {
        socket.off('file_added');
        socket.off('file_deleted');
      }
    }, [room_files, activeFile]);
    
    function addFile(e) {
        e.preventDefault();

        socket.emit('add_file', {
            room_id: room.room_id,
            file_name: new_file_name,
            file_type: new_file_type
        });        
    }

    function deleteSelectedFile(file_id) {
        const result = confirm('Are you sure you want to delete this file?');

        if (result) {
            socket.emit('delete_file', {
                file_id: file_id,
                user_id: user.uid,
                room_id: room.room_id,
                active: activeFile?.file_id
            });
        }
    }

    return (
        <div className='room-top-left'> 
            <div id='file-drawer'>
                {room_files.map((file, index) => {
                    return (
                        <div className={`${activeFile && file.file_id === activeFile?.file_id ? 'active-file' : ''} flex-row item`} key={index} >
                            <button 
                                onClick={() => displayFile(file)}
                                className={'items-center name-button'}>
                                { file.type === 'html' && <FaHtml5 size={22}/> }
                                { file.type === 'css' && <FaCss3 size={22}/> }
                                { file.type === 'js' && <FaJs size={22}/> }
                                <label className='single-line'>{file.name}</label>
                            </button>
                            {deleteFile &&
                                <button className='items-center file-delete' onClick={() => deleteSelectedFile(file.file_id)}> 
                                    <BsTrash size={18}/>
                                </button>
                            }
                        </div>    
                    )})
                }
                {deleteFile &&
                    <>
                        <div className='flex-row file-form-btn'>
                            <button className='file-cancel-btn' onClick={() => setDeleteFile(false)}>Cancel</button>
                        </div>
                        {warning && <label className='label-warning'>{warning}</label>}
                    </>
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
                        {warning && <label className='label-warning'>{warning}</label>}
                    </form>
                }
            </div>
        </div>
    )
}

export default FileDrawer