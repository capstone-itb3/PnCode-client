import React, { useEffect, useState } from 'react'
import { BsBoxArrowInRight } from 'react-icons/bs';


function Options({type, room, user}) {
    const [isChecked, setIsChecked] = useState(true);

    useEffect(() => {

    }, [isChecked]);

    function openPreferences() {
        const preferences = document.getElementById('preferences-menu');
        preferences.classList.toggle('hidden');
    }
    

    function leaveRoom () {
        window.location.href = '/dashboard';
    }  

      return (
    <div className='flex-row items-center' id='room-header'>
        <div className='items-center'>
            {type === 'assigned' &&
            <button className='room-header-options'>
                Files
            </button>

            }
            {type === 'assigned' &&
            <button className='room-header-options'>
                View
            </button>
            }
            <button className='room-header-options' onClick={openPreferences}>
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
        </div>
        <div className='items-center'>
            {type === 'solo' &&
            <button className='room-header-options'>
                Delete Room
            </button>
            }
            <button className='room-header-options' onClick={ leaveRoom }>
                <BsBoxArrowInRight size={23} color={ '#f8f8f8' } />
            </button>
        </div>
    </div>
  )
}

export default Options