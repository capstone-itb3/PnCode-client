import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

function ManageTabs({ collection }) {
    const [showArrows, setShowArrows] = useState(false);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
        checkForArrows();
        window.addEventListener('resize', checkForArrows);

        const buttons = document.querySelectorAll('.manage-button');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });

        const selected = document.getElementById(`${collection}`);

        selected ? selected.classList.add('selected') : navigate('/admin/dashboard/students');

        return () => window.removeEventListener('resize', checkForArrows);  
        } catch(err) {
            window.location.reload();          
        }
    }, [collection]);

    const checkForArrows = () => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowArrows(scrollWidth > clientWidth);
        }
    };

    const scroll = (direction) => {
        const container = scrollContainerRef.current;

        if (container) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const switchCollection = (collection) => {
        navigate(`/admin/dashboard/${collection}/q=&f=`);
    }

    return (
    <div id='manages-tab'>
        {showArrows &&
            <button className='scroll-arrow items-center left' onClick={() => scroll('left')}>
                <RiArrowLeftSLine size={20} />
            </button>
        }
        <nav className='manage-scroll' ref={scrollContainerRef}>

        {(collection === 'students' || collection === 'professors' || collection === 'courses' || collection === 'solo-rooms') === true &&
            <>
                <button id='students' onClick={() => switchCollection('students')} className='manage-button'>Students</button>
                <button id='professors' onClick={() => switchCollection('professors')} className='manage-button'>Professors</button>
            </>
        }
        <button id='courses' onClick={() => switchCollection('courses')} className='manage-button'>Courses</button>
        <button id='classes' onClick={() => switchCollection('classes')} className='manage-button'>Classes</button>

        {(collection === 'classes' || collection === 'teams' || collection === 'activities' || collection === 'assigned-rooms' || collection === 'files') === true &&
            <>
                <button id='teams' onClick={() => switchCollection('teams')} className='manage-button'>Teams</button>
                <button id='activities' onClick={() => switchCollection('activities')} className='manage-button'>Activities</button>
            </>
        }
        {(collection === 'assigned-rooms') === true &&
            <>
                <button id='assigned-rooms' onClick={() => switchCollection('assigned-rooms')} className='manage-button'>Assigned Rooms</button>
            </>
        }
        {(collection === 'files') === true &&
            <button id='files' onClick={() => switchCollection('files')} className='manage-button'>Files</button>
        }
        {!(collection === 'classes' || collection === 'teams' || collection === 'activities' || collection === 'assigned-rooms' || collection === 'files') === true &&
            <button id='solo-rooms' onClick={() => switchCollection('solo-rooms')} className='manage-button'>Solo Rooms</button>
        }
        </nav>
        {showArrows &&
            <button className='scroll-arrow items-center right' onClick={() => scroll('right')}>
                <RiArrowRightSLine size={20} />
            </button>
        }
    </div>
    )
}

export default ManageTabs