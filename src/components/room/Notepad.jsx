import React, { useEffect } from 'react'
import * as Y from 'yjs'
import './utils/prosemirror.css'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'

function Notepad({room, user, socket, cursorColor}) {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
        `${room.room_id.toString()}-notepad`, ydoc
    )
    const type = ydoc.getXmlFragment('prosemirror');

    useEffect(() => {
        provider.awareness.setLocalStateField('user', { 
            name: user.last_name + ', ' + user.first_name[0] + '.',
            color: cursorColor.color,
        })
        
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

        const view = new EditorView(document.querySelector('#notepad'), { state })

        type.observe(() => {
            const content = type.toString();
            socket.emit('save_notepad', {
                room_id: room.room_id, 
                content: content
            })
        })

        return () => {
            view.destroy()
            provider.destroy()
        }
    }, [room, user])

    return <div id='note-container'>
        <div id='notepad'/>
    </div>
}

export default Notepad
