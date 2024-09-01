import React from 'react'
import { BsFillTriangleFill } from "react-icons/bs";

function Instructions({instructions}) {
    
    function toggleInstructions() {
        const instruc = document.getElementById('instructions-container');
        instruc.classList.toggle('opened');
    
        const toOpen = [document.querySelector('#instructions-container'), 
                        document.querySelector('#instructions-container #p'),
                        document.querySelector('#editor-header #btn')];

        toOpen.forEach(item => {
            item.classList.toggle('closed');
        });
    }
    

    return (
        <div className='flex-row' id='editor-header'>
            <div id='instructions-container'>
                <p id='p'><b>Instructions:  </b>{instructions}</p>
            </div>
            <button id='btn' onClick={toggleInstructions}>
                <label><BsFillTriangleFill size={12}/></label>
            </button>
        </div>
    )
}

export default Instructions