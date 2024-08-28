import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';


function TabCourse({user}) {
    const [showArrows, setShowArrows] = useState(false);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        console.log(user);
        try {
            checkForArrows();
            window.addEventListener('resize', checkForArrows);
    
            const buttons = document.querySelectorAll('.course-button');
            buttons.forEach(button => {
                button.classList.remove('selected');
            });
    
            if (user.position === 'Student') {
                const selected = document.getElementById(`${params.course}`);
    
                selected
                ? selected.classList.add('selected')
                : navigate(`/dashboard/${user.enrolled_courses[0].course_code}/all`);
    
            } else if (user.position === 'Professor') {
                const selected = document.getElementById(`${params.course}-${params.section}`);
    
                selected
                ? selected.classList.add('selected')
                : navigate(`/dashboard/${user.assigned_courses[0].course_code}/${user.assigned_courses[0].sections[0].toString()}/all`);
            }

            return () => window.removeEventListener('resize', checkForArrows);  

        } catch(err) {
            window.location.reload();          
        }
    }, [params]);

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
    const scrollLeft = () => scroll('left');
    const scrollRight = () => scroll('right');

    function switchTab(course_code, section) {

        const newUrl = params.select 
            ? `/dashboard/${course_code}/${section}/${params.select}`
            : `/dashboard/${course_code}/${section}`;

        navigate(newUrl);
    }

    return (
        <div id='courses-tab'>
            {showArrows && 
            <button className="scroll-arrow left" onClick={scrollLeft}>&lt;</button>}
            <div className='course-scroll width-100' ref={scrollContainerRef}>
                {user.position === 'Student' && user.enrolled_courses.map((course) => (
                    <button 
                        className="course-button"
                        key={`${course.course_code}`}
                        id={`${course.course_code}`}
                        onClick={()=> navigate(`/dashboard/${course.course_code}/${params.select}`)}>
                        {course.course_code}
                    </button>
                ))}
                {user.position === 'Professor' && user.assigned_courses.map((course) => (
                    course.sections.map((section) => (
                        <button 
                            className="course-button"
                            id={`${course.course_code}-${section}`}
                            key={`${course.course_code}-${section}`} 
                            onClick={()=> navigate(`/dashboard/${course.course_code}/${section}/${params.select}`) }>
                            {section} - {course.course_code}
                        </button>
                    ))
                ))}
            </div>
            {showArrows && 
            <button className="scroll-arrow right" onClick={scrollRight}>&gt;</button>}
        </div>
    )
}

export default TabCourse