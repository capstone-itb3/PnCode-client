import React, { useState, useEffect, useRef } from 'react'
import { FaHtml5, FaCss3, FaJs } from 'react-icons/fa';
import { BsTrash } from 'react-icons/bs';
function FileDrawer({room, user, socket, room_files, setRoomFiles, activeFile, displayFile, addNewFile, setAddNewFile, deleteFile, setDeleteFile}) {
    const [new_file_name, setNewFileName] = useState('');
    const [new_file_type, setNewFileType] = useState('html');
    const [warning, setWarning] = useState(null);
    const addFileRef = useRef(null);
    const deleteFileRef = useRef(null);

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
    
    useEffect(() => {
        if (addNewFile && addFileRef.current) {
          addFileRef.current.focus();
        }

        if (deleteFile && deleteFileRef.current) {
          deleteFileRef.current.focus();
        }
    }, [addNewFile, deleteFile]);
      
    function useFile(file) {
        if (!deleteFile) {
            displayFile(file);
        } else {
            const result1 = confirm(`Do you want to delete ${file.name}?`);

            if (result1) {
                const result2 = confirm('Deleting a file cannot be undone. Are you sure you want to continue?');

                if (result2) {
                    socket.emit('delete_file', {
                        file_id: file.file_id,
                        user_id: user.uid,
                        room_id: room.room_id,
                        active: activeFile?.file_id
                    });
                }
            }
        }
    }


    function addFile(e) {
        e.preventDefault();

        socket.emit('add_file', {
            room_id: room.room_id,
            file_name: new_file_name,
            file_type: new_file_type
        });        
    }

    return (
        <div className='room-top-left'> 
            <div id='file-drawer'>
                <label className='head'>
                    <span>#</span>
                    <span>Type</span>
                    <span>Name</span>
                </label>
                {room_files.map((file, index) => {
                    return (
                        <button className={`${activeFile && file.file_id === activeFile?.file_id ? 'active-file' : ''} items-center flex-row item`} 
                            key={index} 
                            onClick={() => useFile(file)}>
                            <div className='items-center'>
                                <span>{index + 1}</span>
                                { file.type === 'html' && <FaHtml5 size={22}/> }
                                { file.type === 'css' && <FaCss3 size={22}/> }
                                { file.type === 'js' && <FaJs size={22}/> }
                                <label className='single-line'>{file.name}</label>
                            </div>
                            {deleteFile &&
                                <label className='file-delete items-center'> 
                                    <BsTrash size={18}/>
                                </label>
                            }
                        </button>    
                    )})
                }
                {deleteFile &&
                    <>
                        <div className='flex-row file-form-btn'>
                            <button className='file-cancel-btn' ref={deleteFileRef} onClick={() => setDeleteFile(false)}>Cancel</button>
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
                            <input
                                type='text'
                                className='file-name-input'
                                value={new_file_name}
                                onChange={(e) => setNewFileName(e.target.value)}
                                ref={addFileRef}
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