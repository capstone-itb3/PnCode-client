import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import './prosemirror.css'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from './utils/schema'

function Notepad({room, user, socket}) {
    const editorRef = useRef(null)
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('wss://codlin-server.onrender.com', 
        `${room.room_id.toString()}-notepad`, ydoc
    )
    const type = ydoc.getXmlFragment('prosemirror');

    useEffect(() => {
        provider.awareness.setLocalStateField('user', { color: '#008833', name: user.first_name })
        
        const state = EditorState.create({
            schema,
            plugins: [
                ySyncPlugin(type),
                yUndoPlugin(),
                keymap({
                    'Mod-z': undo,
                    'Mod-y': redo,
                    'Mod-Shift-z': redo
                })
            ].concat(exampleSetup({ schema }))
        })

        const view = new EditorView(editorRef.current, { state })

        type.observe(() => {
            const content = type.toString();
            console.log(content);
            socket.emit('save_notepad', {room_id: room.room_id, content: content})
        })

        return () => {
            view.destroy()
            provider.destroy()
        }
    }, [room, user])

    return <div className='member-list'>
         <div id='notepad'ref={editorRef} />
    </div>
}

export default Notepad
