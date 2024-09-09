import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Frame from 'react-frame-component';
import Cookies from 'js-cookie';
import { getToken, getClass } from '../validator'

function FullView() {
    const { room_id, file_name } = useParams();
    // const [auth, getAuth] = useState(getToken(Cookies.get('token')));
    // const [user, setUser] = useState(getClass(auth, auth.position));
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileExists, setFileExists] = useState(true);
    const outputRef = useRef(null);
    const initialContent = `<!DOCTYPE html><html><head>
                                <base target="_parent">
                            </head><body></body></html>`;

    useEffect(() => {
        async function init () {
            // const info = await user.viewOutput(room_id, file_name);

            if (info?.files) {
                // let newStyle = '', newScript = '';
                // const cssFiles = info.files.filter(f => f.type === 'css');
                // const jsFiles = info.files.filter(f => f.type === 'js');

                // setTimeout(() => {
                //     if (info.active.type === 'html' || info.active.type === 'css') {                    
                //         outputRef.current.contentDocument.body.innerHTML = info.active.content;
                        
                //         const links = outputRef.current.contentDocument.querySelectorAll('link[rel="stylesheet"]');
                //         links.forEach((link) => {
                //         if (link.href) {
                //             const linkUrl = new URL(link.href).pathname.split('/').pop();
                //             const css = cssFiles.find(f => f.name === linkUrl);
                    
                //             if (css) {
                //                 newStyle +=`<style>${css.content}</style>`;
                //             }
                //         }
                //         });
                //         outputRef.current.contentDocument.body.innerHTML = newStyle + outputRef.current.contentDocument.body.innerHTML;

                //         const scripts = outputRef.current.contentDocument.querySelectorAll('script');
                //         scripts.forEach((script) => {

                //             if (script.src) {
                //                 const scriptUrl = new URL(script.src).pathname.split('/').pop();
                //                 const js = jsFiles.find(f => f.name === scriptUrl);
                        
                //                 if (js) {
                //                     newScript = js.content;
                //                 } 
                //             } else {
                //                 newScript = script.textContent;
                //             }

                //             convertToScriptTag(newScript);
                //         });

                //     } else if (info.active.type === 'js') {
                //         outputRef.current.contentDocument.body.innerHTML = '';
                //         convertToScriptTag(info.active.content);
                //     }

                //     const title = outputRef.current.contentDocument.querySelector('title')?.textContent;
                //     if (title !== undefined && !(/^\s*$/.test(title))) {
                //         document.title = title;
                //     } else {
                //         document.title = file_name;
                //     }
                // }, 100);  
            } else {
                setFileExists(false);
            }
            setIsLoaded(true);
        }
        init();
    },[]);

    function convertToScriptTag(script) {
        const locationHrefRegex = /window\.location\.href\s*=(?!=)/g;
        script = script.replace(locationHrefRegex, 'window.parent.location.href =');
        const scriptTag = document.createElement('script');
        scriptTag.text = script;
        outputRef.current.contentDocument.head.appendChild(scriptTag);
    }

    function contentDidMount() {

    }

    return (
        <div className='full-view-container'>
            {!isLoaded &&
                    <div className='loading-line'>
                        <div></div>
                    </div>
            }
            <label>Its bugged</label>
            {/* <Frame 
                ref={outputRef}
                id='full-view-iframe'
                initialContent={initialContent}/> */}
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