import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import './utils/prosemirror.css'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'
import { DOMParser as ProsemirrorDOMParser } from 'prosemirror-model'

function Notepad({room, user, socket, editorUsers, cursorColor}) {
    const ydocRef = useRef(new Y.Doc());
    const viewRef = useRef(null);
    const typeRef = useRef(null);

    useEffect(() => {
        const ydoc = ydocRef.current;
        const provider = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
            `${room.room_id.toString()}-notepad`, ydoc
        );
        typeRef.current = ydoc.getXmlFragment('prosemirror');

        async function init() {
            return new Promise((resolve) => {
                socket.emit('load_notepad', { room_id: room.room_id });
                socket.on('notepad_loaded', ({ notes }) => {
                    console.log(notes);
                    resolve(notes);
                });
            });
        }

        init().then((notes) => {
            provider.awareness.setLocalStateField('user', { 
                name: user.last_name + ', ' + user.first_name[0] + '.',
                color: cursorColor.color,
            });

            const state = EditorState.create({
                schema,
                plugins: [
                    ySyncPlugin(typeRef.current),
                    yCursorPlugin(provider.awareness),
                    yUndoPlugin(),
                    keymap({
                        'Mod-z': undo,
                        'Mod-y': redo,
                        'Mod-Shift-z': redo
                    })
                ].concat(exampleSetup({ schema }))
            });

            viewRef.current = new EditorView(document.querySelector('#notepad'), { state });

            function parseContent(content) {
                const parser = new DOMParser()
                const doc = parser.parseFromString(`<root>${content}</root>`, 'text/xml')
                return ProsemirrorDOMParser.fromSchema(schema).parse(doc.documentElement)
            }
            
            if (notes && notes.length > 0) {
                const parsedContent = parseContent(notes)
                const transaction = viewRef.current.state.tr.replace(
                    0,
                    viewRef.current.state.doc.content.size,
                    parsedContent.content
                )
                viewRef.current.dispatch(transaction)
            }
                                    
            typeRef.current.observe(() => {
                const content = typeRef.current.toString();
                socket.emit('save_notepad', {
                    room_id: room.room_id, 
                    content: content
                });
            });
        });

        return () => {
            if (viewRef.current) viewRef.current.destroy();
            provider.destroy();
            socket.off('notepad_loaded');
        };
    }, [room, user, socket, cursorColor]);

    return <div id='note-container'>
        <div id='notepad'/>
    </div>;
}

export default Notepad;
