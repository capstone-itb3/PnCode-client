import React, { useEffect, useState } from 'react'
import { BsBoxArrowInRight } from 'react-icons/bs';


function Options({type, room, user, setAddNewFile}) {
    const [isChecked, setIsChecked] = useState(true);


    useEffect(() => {

    }, [isChecked]);

    function openMenu(clicked) {
        const all_menus = document.querySelectorAll('.options-menu');
        all_menus.forEach((menu) => {
            menu.classList.add('hidden');
        });
    
        const option = document.getElementById(`${clicked}-menu`);
        option.classList.toggle('hidden');
    }

    function addFile() {
        setAddNewFile(true);
        const option = document.getElementById(`files-menu`);
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
                    <div className='item items-center' onClick={addFile}>
                        <label>Add File</label>
                    </div>
                    <div className='item items-center'>
                        <label>Delete File</label>
                    </div>
                </div>
            </>
            }
            {type === 'assigned' &&
            <button className='room-header-options'>
                View
            </button>
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
            <button className='room-header-options'>
                Run
            </button>
            {type === 'solo' &&
                <button className='room-header-options'>
                    Delete Room
                </button>
            }
        </>
    )
}

export default Options