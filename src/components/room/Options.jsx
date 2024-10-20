import React, { useEffect, useState, useRef } from 'react'
import Cookies from 'js-cookie';
import checkTimeframe from './utils/checkTimeframe';

function Options({type, room, user, socket, open_time, close_time, setLeftDisplay, setRightDisplay, setEditorTheme, outputRef, setAddNewFile, setDeleteFile, runOutput}) {
    const isOnTimeRef = useRef(type === 'assigned' ? checkTimeframe(open_time, close_time) : true);
    const [isChecked, setIsChecked] = useState(() => {
        if (Cookies.get('theme') === 'dark' || !Cookies.get('theme')) {
            return true;
        } else {
            return false;
        }
    });

    function openMenu(clicked) {
        if (clicked === 'files' && type === 'assigned') {
            isOnTimeRef.current = checkTimeframe(open_time, close_time);
        }
        const option = document.getElementById(`${clicked}-menu`);
        if (option) {
            option?.classList?.toggle('hidden');
        }

        document.querySelectorAll('.options-menu').forEach((menu) => {
            if (menu.id !== option?.id && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    }

    function addFile() {
        setDeleteFile(false);
        setAddNewFile(true);
        setLeftDisplay('files');

        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    function openFile() {
        setLeftDisplay('files');

        if (setAddNewFile && setDeleteFile) {
            setAddNewFile(false);
            setDeleteFile(false);
        }
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');

        const first_file = document.querySelector('#file-drawer .item');

        if (first_file) {
            first_file.focus();
        }
    }
    
    function deleteFile() {
        setAddNewFile(false);
        setDeleteFile(true);
        setLeftDisplay('files');
        
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

    function closeSection(direction) {
        if (direction === 'left') {
            setLeftDisplay('');
        } else if (direction === 'right') {
            setRightDisplay('');
        }

        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    function changeTheme(checked, from) {
        const theme = checked ? 'dark' : 'light';
        user.changeTheme(theme);
        setIsChecked(checked);
        setEditorTheme(theme);

        const theme_btn = document.getElementById('editor-theme');
        if (theme_btn && from === 'button') {
            theme_btn.checked = checked;
        }
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
            <button className='room-header-options' onClick={() => openMenu('files')}>
                Files
            </button>
            {isOnTimeRef.current &&
                <div id='files-menu' className='flex-column options-menu hidden'>
                    {user.position === 'Student' && type === 'assigned' &&
                        <button className='item items-center'  onClick={addFile}>
                            <label>Add File</label><span>Alt + A</span>
                        </button>
                    }
                    <button className='item items-center'  onClick={openFile}>
                        <label>Open File</label><span>Alt + (#)</span>
                    </button>
                    {user.position === 'Student' && type === 'assigned' &&
                        <button className='item items-center' onClick={deleteFile}>
                            <label>Delete File</label><span>Alt + X</span>
                        </button>
                    }
                </div>
            }
            <button className='room-header-options' onClick={() => openMenu('view')}>
                View
            </button>
            <div id='view-menu' className={`flex-column options-menu hidden ${user?.position === 'Professor' && 'prof'}`}>
                <button className='item items-center' onClick={() => viewSection('files')}>
                    <label>Show Files</label><span>Alt + F</span>
                </button>
                {type === 'assigned' &&
                    <button className='item items-center' onClick={() => viewSection('notepad')}>
                        <label>Show Notepad</label><span>Alt + N</span>
                    </button>
                }
                <button className='item items-center' onClick={() => viewSection('output')}>
                    <label>Show Output</label><span>Alt + O</span>
                </button>
                {type === 'assigned' &&
                <>
                    <button className='item items-center' onClick={() => viewSection('history')}>
                        <label>Show History</label><span>Alt + H</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('feedback')}>
                        <label>Show Feedback</label><span>Alt + B</span>
                    </button>
                </>
                }
                <button className='item items-center' onClick={() => closeSection('left')}>
                    <label>Close Left Tabs</label><span>Alt + L</span>
                </button>
                <button className='item items-center' onClick={() => closeSection('right')}>
                    <label>Close Right Tabs</label><span>Alt + P</span>
                </button>
            </div>
            <button className='room-header-options' onClick={() => openMenu('preferences')}>
                Preferences
            </button>
            <div id='preferences-menu' className={`flex-column options-menu hidden ${user?.position === 'Professor' && 'prof'}`}>
                <div className='item items-center'>
                    <label>Editor Theme</label>
                    <div className='items-center'>
                        <label className="switch">
                            <input 
                                id='editor-theme'
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
            <div id='run-menu' className={`flex-column options-menu hidden ${user?.position === 'Professor' && 'prof'}`}>
                <button className='item items-center' onClick={runCode}>
                    <label>Run</label> <span>Alt + R</span>
                </button>
                <button className='item items-center'>
                    <label>Run in Full View</label>
                </button>
            </div>
        </>
    )
}

export default Options