import React, { useState, useEffect } from 'react'
import Avatar from 'react-avatar';
import { IoIosArrowDropdown } from 'react-icons/io';

function Chats({room, socket, user}) {
    const [chats, setChats] = useState(null);
    const [message, setMessage] = useState('');
    const [isMaximized, setIsMaximized] = useState(true);

    useEffect(() => {
        socket.emit('load_messages', {
            room_id: room.room_id,
        });

        socket.on('messages_loaded', ({chat_data}) => {
            setChats(chat_data);

            setTimeout(() => {
                const scroll = document.getElementById('chat-box-scroll');
                scroll.scrollTop = scroll.scrollHeight;
            },100);
        })

        socket.on('update_messages', ({new_message}) => {
            setChats(prev => [...prev, new_message]);

            setTimeout(() => {
                const scroll = document.getElementById('chat-box-scroll');
                scroll.scrollTop = scroll.scrollHeight;
            },100);
        });

        return () => {
            socket.off('messages_loaded');
            socket.off('update_messages');
        }
    }, [room]);

    function minimizeChat() {
        const chatBox = document.getElementById('chat-box-container');

        setIsMaximized(!isMaximized);
        chatBox.classList.toggle('hidden');
    }

    function sendMessage(e) {
        e.preventDefault();
        setMessage('');

        socket.emit('send_message', {
            user_id: user.uid,
            first_name: user.first_name,
            last_name: user.last_name,
            room_id: room.room_id,
            message: message,
        });
    }

    return (
        <div className='flex-column' id='chat-box-container'>
            <div className='flex-row items-center' id='chat-box-header'>
                <label>Chat</label>
                <button id='chat-box-btn' className='items-center' onClick={minimizeChat}><IoIosArrowDropdown size={22}/></button>
            </div>
            <div id='chat-box-body'>
                <div  className='flex-column' id='chat-box-scroll'>
                    <label id='first-message'>
                        Start a conversation to your teammates within this room.
                    </label>
                    {chats && chats.map((chat, index) => {

                        return (
                            <div className={`chat-box-message ${chat.sender_uid === user.uid ? 'self': ''}`} 
                                 key={index}>
                                <div className='chat-box-message-avatar'>
                                    <Avatar name={ `${chat.last_name}, ${chat.first_name.charAt(0)}`} size='23' round={true} />
                                </div>
                                <div className='chat-box-message-text flex-column'>
                                    <label className='single-line name'>{`${chat.last_name}, ${chat.first_name}`}</label>
                                    <p className='chat_body'>{chat.chat_body}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <form className='flex-row' id='chat-box-footer' onSubmit={(e) => {sendMessage(e)}}>
                {chats &&
                    <>
                        <input type='text' 
                        placeholder='Type a message...' 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}/>
                        <input type='submit' id='send-chat-btn' value='Send'/>
                    </>
                }
            </form>
        </div>
    )
}

export default Chats
