import React, { useEffect, useState } from 'react'

function Options({type, room, user, outputRef, setAddNewFile, runOutput}) {
    const [isChecked, setIsChecked] = useState(true);

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
        setAddNewFile(true);
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
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
                    <div className='item items-center'>
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
                    <div className='item items-center'>
                        <label>Files/Notepad</label>
                    </div>
                    <div className='item items-center'>
                        <label>Members</label>
                    </div>
                    <div className='item items-center'>
                        <label>Output</label>
                    </div>
                </div>
            </>
            }
            <button className='room-header-options' onClick={() => openMenu('preferences')}>
                Preferences
            </button>
            <div id='preferences-menu' className='flex-column options-menu hidden'>
                <div className='item items-center'>
                    <label>Dark Theme</label>
                    <div className='items-center'>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
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
                    <label>Run</label>
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