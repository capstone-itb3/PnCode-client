import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import _ from 'lodash'

function Notepad({room, user, socket, editorUsers, cursorColor}) {
    const notepadRef = useRef(null);
    const providerRef = useRef(null);
  
    useEffect(() => {
        notepadRef.current ? notepadRef.current?.destroy() : null;
        providerRef.current ? providerRef.current?.destroy() : null;
    
        async function init() {
            return new Promise((resolve) => {
                socket.emit('load_notepad', {
                    room_id: room.room_id,
                });
            
                socket.on('notepad_loaded', ({ notes }) => {
                    resolve(notes);
                });
            });
        }
        init().then((notes) => {
            const ydoc = new Y.Doc();
      
            providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
                `${room.room_id}-notepad`, 
                ydoc
            );
            
            providerRef.current.awareness.setLocalStateField('user', {
                userId: user.uid,
                name: user.last_name + ', ' + user.first_name,
                color: cursorColor.color,
            });
      
            const setup = () => {
                if (user?.position === 'Student') {
                    return EditorState.readOnly.of(false);
                } else if (user?.position === 'Professor') {
                    return EditorState.readOnly.of(true);
                }
            }

            providerRef.current.on('synced', () => {
                const ytext = ydoc.getText('codemirror');
                let initialContent = ytext.toString();
                if (((initialContent === '' || initialContent === null) && editorUsers.length === 1)) {
                    ydoc.transact(() => {
                        ytext.insert(0, notes);
                    });
                    initialContent = notes;
                }

                const state = EditorState.create({
                    doc: initialContent,
                    extensions: [
                        keymap.of([...yUndoManagerKeymap, { key: 'Enter', run: (view) => {
                            view.dispatch(view.state.replaceSelection('\n'))
                            return true
                            }}
                        ]),
                        setup(),
                        yCollab(ytext, providerRef.current.awareness),
                        EditorView.lineWrapping,
                        EditorView.updateListener.of(e => {
                            if (e.docChanged) {
                                socket.emit('save_notepad', {
                                    room_id: room.room_id,
                                    content: e.state.doc.toString(),
                                });
                            }
                        }),
                    ]
                });

                const notepad = document.getElementById('notepad');
                notepad.innerHTML = '';

                notepadRef.current = new EditorView({ state, parent: (notepad) });
                notepadRef.current.focus();
            });
        })
      

        return () => {
            providerRef.current ? providerRef.current?.destroy() : null;
            notepadRef.current ? notepadRef.current?.destroy() : null;
            socket.off('notepad_loaded');
        };
    }, [room, user, socket, cursorColor]);

    return <div id='note-container'>
        <div id='notepad'/>
    </div>;
}

export default Notepad;
