import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Frame from 'react-frame-component';
import Cookies from 'js-cookie';
import { getToken, getClass } from '../validator'
import toast from 'react-hot-toast';

function FullView() {
    const { room_id, file_name } = useParams();
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));
    const [user, setUser] = useState(getClass(auth, auth.position));
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileExists, setFileExists] = useState(true);
    const outputRef = useRef(null);
    const navigate = useNavigate();

    const initialContent = 
    `<!DOCTYPE html>
     <html>
        <head>
            <base href="${import.meta.env.VITE_APP_BACKEND_URL}/view/${room_id}/" target="_parent">
        </head>
        <body>
        </body>
    </html>`;

    useEffect(() => {
        renderContent();
    }, [])

    async function renderContent() {
        const info = await user.viewOutput(room_id, file_name);

        if (!info) {
            navigate('/error/404');
        }
        if (info.active.type === 'html' || info.active.type === 'css') {                    
            outputRef.current.contentDocument.body.innerHTML = info.active.content;
        }                
    
        setIsLoaded(true);

        const title = outputRef.current.contentDocument.querySelector('title')?.textContent;
        if (title !== undefined && !(/^\s*$/.test(title))) {
            document.title = title;
        } else {
            document.title = file_name;
        }
    }    

    return (
        <div className='full-view-container'>
            {!isLoaded &&
                <div className='loading-line'>
                    <div></div>
                </div>
            }
            <Frame 
                ref={outputRef}
                id='full-view-iframe'
                initialContent={initialContent}
            />
            {!fileExists &&
                <div className='flex-column items-center'>
                    <h1>File Does Not Exist</h1>
                    <a href='/dashboard'>
                        &lt; Back to Dashboard
                    </a>
                </div>
            }
        </div>
  )
}

export default FullView