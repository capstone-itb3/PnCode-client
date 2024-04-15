import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/seti.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/trailingspace';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import { Do } from '../../commands';

function Editor({ socketRef, room_id, onCodeChange }) {
  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(document.getElementById('editor'),
          {
              mode: {name: 'htmlmixed', json: true},
              theme: 'seti',
              autoCloseTags: true,
              autoCloseBrackets: true,
              showTrailingSpace: true,
              lineNumbers: true
          }
      );
      editorRef.current = editor;

      editor.setSize(null, '100%');
      editorRef.current.on(Do.CHANGE, (instance, changes) => {
        console.log('changes', instance, changes);
        const { origin } = changes; 
        const code = instance.getValue();
        onCodeChange(code);

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

  return (
    <div className='editor-div'>
        <textarea id='editor'></textarea>
    </div>
  )
}

export default Editor