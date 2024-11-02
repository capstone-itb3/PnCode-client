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
    const initialContent = `<!DOCTYPE html><html><head><base target="_parent"></head><body></body></html>`;

    useEffect(() => {
        renderContent();
    }, [])

    async function renderContent() {
        const info = await user.viewOutput(room_id, file_name);

        if (!info) {
            navigate('/error/404');
        }

        if (info?.files) {
            let newStyle = '', newScript = '';
            const cssFiles = info.files.filter(f => f.type === 'css');
            const jsFiles = info.files.filter(f => f.type === 'js');
            if (info.active.type === 'html' || info.active.type === 'css') {                    
                outputRef.current.contentDocument.body.innerHTML = info.active.content;
                
                const links = outputRef.current.contentDocument.querySelectorAll('link[rel="stylesheet"]');
                for (const link of links) {
                    if (link.href) {
                        const linkUrl = new URL(link.href).pathname.split('/').pop();
                        const css = cssFiles.find(f => f.name === linkUrl);

                        if (css) {
                            newStyle +=`<style>${css.content}</style>`;
                        }
                    }
                };
                outputRef.current.contentDocument.body.innerHTML = newStyle + outputRef.current.contentDocument.body.innerHTML;
    
                const scripts = outputRef.current.contentDocument.querySelectorAll('script');
                scripts.forEach((script) => {
                    if (script.src) {
                        const scriptUrl = new URL(script.src).pathname.split('/').pop();
                        const js = jsFiles.find(f => f.name === scriptUrl);
                
                        if (js) {
                            newScript = js.content;
                        } 
                    } else {
                        newScript = script.textContent;
                    }
                    convertToScriptTag(newScript);
                });
            } else if (info.active.type === 'js') {
                outputRef.current.contentDocument.body.innerHTML = '';
                convertToScriptTag(info.active.content);
            }
    
            setIsLoaded(true);

            const title = outputRef.current.contentDocument.querySelector('title')?.textContent;
            if (title !== undefined && !(/^\s*$/.test(title))) {
                document.title = title;
            } else {
                document.title = file_name;
            }
        }
    }    

    function convertToScriptTag(script) {
        const locationHrefRegex = /window\.location\.href\s*=(?!=)/g;
        script = script.replace(locationHrefRegex, 'window.parent.location.href =');
        const scriptTag = document.createElement('script');
        scriptTag.text = script;
        outputRef.current.contentDocument.head.appendChild(scriptTag);
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