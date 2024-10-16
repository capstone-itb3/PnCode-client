import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import _ from 'lodash'
import notepadListener from './utils/notepadListener'

function Notepad({room, user, socket, cursorColor}) {
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
                if (((initialContent === '' || initialContent === null) && providerRef.current.awareness.getStates()?.size === 1)) {
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
                    ]
                });

                const notepad = document.getElementById('notepad');
                notepad.innerHTML = '';
                notepadRef.current = new EditorView({ state, parent: (notepad) });

                if (user?.position === 'Student') {
                    notepadRef.current.focus();

                    notepad.addEventListener('keydown', e => notepadListener(e, updateNotes));
                }
            });
        })

        return () => {
            if (user?.position === 'Student') {
                document.getElementById('notepad')?.removeEventListener('keydown', notepadListener);
            }
            providerRef.current ? providerRef.current?.destroy() : null;
            notepadRef.current ? notepadRef.current?.destroy() : null;
            socket.off('notepad_loaded');
        };
    }, [room, user, socket, cursorColor]);

    const updateNotes = _.debounce(() => {
        if (notepadRef.current) {
            socket.emit('save_notepad', {
                room_id: room.room_id,
                content: notepadRef.current.state.doc.toString(),
            });
        }
    }, 200);

    return (    
        <div id='note-container'>
            <div id='notepad'/>
        </div>
    )
}

export default Notepad;
