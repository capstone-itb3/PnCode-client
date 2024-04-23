import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/trailingspace';
import 'codemirror/mode/htmlmixed/htmlmixed';
import { Do } from '../../commands';

function Editor({ socketRef, room_id, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {    
    const init = async () => {
      const editor = CodeMirror.fromTextArea(document.getElementById('editor'),
          {
              mode: {name: 'htmlmixed', json: true},
              theme: 'ayu-mirage',
              autoCloseTags: true,
              autoCloseBrackets: true,
              showTrailingSpace: true,
              lineNumbers: true
          }
      );
      editorRef.current = editor;

      async function fetchData() {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/verify-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            room_id: room_id
          })
        });
        const data = await response.json();
  
        editor.setValue(data.code); 
        displayOutput(data.code);
      }
      fetchData();
  

      editor.setSize(null, '100%');
      editorRef.current.on(Do.CHANGE, (instance, changes) => {
        const { origin } = changes; 
        const code = instance.getValue();

        onCodeChange(code);
        displayOutput(code);

        if (origin !== 'setValue') {
          socketRef.current.emit(Do.UPDATE, {
            room_id,
            code
          });
        };
      });
    };
    init();
  }, []);

  useEffect(() => {
    if(socketRef.current) {
      socketRef.current.on(Do.UPDATE, ({ code }) => {
        if(code !== null) {
          editorRef.current.setValue(code);    
        };
      });
    }
    return () => {
      socketRef.current.off(Do.UPDATE);
    }
  }, [socketRef.current]);

  function displayOutput(code) {
    let output = document.getElementById('output-div');           
    output.contentDocument.body.innerHTML = code;
    
    try {
      const scripts = output.contentDocument.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        output.contentWindow.eval(scripts[i].innerText);
      }
    } catch(e) {}
  }
  return (
    <div id='editor-div'>
        <textarea id='editor'></textarea>
    </div>
  )
}

export default Editor