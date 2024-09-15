import React, { useEffect, useState } from 'react'

function Options({type, room, user, socket, setLeftDisplay, setRightDisplay, setEditorTheme, outputRef, setAddNewFile, setDeleteFile, runOutput}) {
    const [isChecked, setIsChecked] = useState(user.preferences.theme === 'dark' ? true : false);

    function openMenu(clicked) {
        const option = document.getElementById(`${clicked}-menu`);
        option.classList.toggle('hidden');

        document.querySelectorAll('.options-menu').forEach((menu) => {
            if (menu.id !== option.id && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    }

    function addFile() {
        setDeleteFile(false);
        setAddNewFile(true);

        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    function deleteFile() {
        setAddNewFile(false);
        setDeleteFile(true);
        
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    function viewSection (view) {
        if (view === 'files' || view === 'notepad') {
            setLeftDisplay(view);
        } else if (view === 'output' || view === 'history' || view === 'feedback') {
            setRightDisplay(view);
        }
        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    function changeTheme(checked) {
        const theme = checked ? 'dark' : 'light';
        user.changeTheme(socket, theme);
        setIsChecked(checked);
        setEditorTheme(theme);
    }


    function runCode() {
        if (outputRef.current) {
            runOutput();
        }
        const option = document.getElementById(`run-menu`);
        option.classList.toggle('hidden');
    }

    return (
        <>
            {type === 'assigned' &&
            <>
                <button className='room-header-options' onClick={() => openMenu('files')}>
                    Files
                </button>
                <div id='files-menu' className='flex-column options-menu hidden'>
                    <div className='item items-center'  onClick={addFile}>
                        <label>Add File</label>
                    </div>
                    <div className='item items-center' onClick={deleteFile}>
                        <label>Delete File</label>
                    </div>
                </div>
            </>
            }
            {type === 'assigned' &&
            <>
                <button className='room-header-options' onClick={() => openMenu('view')}>
                    View
                </button>
                <div id='view-menu' className='flex-column options-menu hidden'>
                    <div className='item items-center' onClick={() => viewSection('files')}>
                        <label>Show Files</label><span>Alt + F</span>
                    </div>
                    <div className='item items-center' onClick={() => viewSection('notepad')}>
                        <label>Show Notepad</label><span>Alt + N</span>
                    </div>
                    <div className='item items-center' onClick={() => viewSection('output')}>
                        <label>Show Output</label><span>Alt + O</span>
                    </div>
                    <div className='item items-center' onClick={() => viewSection('history')}>
                        <label>Show History</label><span>Alt + H</span>
                    </div>
                    <div className='item items-center' onClick={() => viewSection('feedback')}>
                        <label>Show Feedback</label><span>Alt + B</span>
                    </div>

                </div>
            </>
            }
            <button className='room-header-options' onClick={() => openMenu('preferences')}>
                Preferences
            </button>
            <div id='preferences-menu' className='flex-column options-menu hidden'>
                <div className='item items-center'>
                    <label>Editor Theme</label>
                    <div className='items-center'>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={(e) => changeTheme(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            <button className='room-header-options' onClick={() => openMenu('run')}>
                Run
            </button>
            <div id='run-menu' className='flex-column options-menu hidden'>
                <div className='item items-center' onClick={runCode}>
                    <label>Run</label> <span>Alt + R</span>
                </div>
                <div className='item items-center'>
                    <label>Run in Full View</label>
                </div>
            </div>
            {type === 'solo' &&
                <button className='room-header-options'>
                    Delete Room
                </button>
            }
        </>
    )
}

export default Options