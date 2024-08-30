import React, { useEffect } from 'react'
import { ImArrowUpRight2 } from 'react-icons/im';

function TabOutput() {
    useEffect(() => {
        // if(socket && view.state.doc !== null) {
        //   socket.emit('update', {
        //     room_id,
        //     code: updates,
        //     socketId
        //   })
    
        //   socket.on('sync', ({ code }) => {
        //     if (code !== null && view.state.doc !== null) {
        //       view.state.doc = code; 
    
        //       let iframe = document.getElementById('output-div').contentWindow.document;
        //       iframe.open();
        //       iframe.write(view.state.doc.toString());
        //       iframe.close(); 
        //     }
        //       console.log('hello')
        //   });
    }, []);

    let showtrigger = 0;
    const hideView = () => {
      let editor = document.getElementById('editor-div');
      let output = document.getElementById('output-div');
  
      if(showtrigger % 2 === 0) {
        editor.style.width = '100%';
        output.style.width = 0;  
      } else {
        editor.style.width = '50%';
        output.style.width = '50%';  
      }
      showtrigger++;
    }
  
    const fullView = () => {
    }
  
    return (
        <div id='output-div'>
            <div className='output-header'>
                <label>Output</label>
                <div className='items-center'>
                    <button className='output-btn items-center' id='hide-btn' onClick={ hideView } >—</button>
                    <button className='output-btn items-center' id='full-btn' onClick={ fullView } >
                    <ImArrowUpRight2 color={'#505050'}size={17}/>
                    </button>
                </div>
            </div>
            <iframe title= 'Displays Output' id='output-iframe' /**onKeyUp={ escapeFullView }*/>
            </iframe>
        </div>
    )
}

export default TabOutput