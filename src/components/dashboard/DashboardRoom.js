import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { jwtDecode } from 'jwt-decode';

function DashboardRoom({auth}) {
    const navigate = useNavigate();

    const [username, setUsername] = useState(() => {
        console.log(auth.username);
        return auth.username;
    });

    // useEffect(() => {
    //     async function loginAccount(event) {
    //         event.preventDefault();
    
    //         const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/login', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'   
    //             },
    //             body: JSON.stringify({
    //                 username,
    //                 password,
    //             })
    //         })
    
    //         const data = await response.json(); 
    //         if (data.user) {
    //             Cookies.set('token', data.user, { expires : 90 });
    //             alert ('Login successful');
    //             navigate('/dashboard');
                
    //         } else {
    //             alert('Incorrect username or password');
    //         } 
    //     };
    
    // }, []);

    //* not yet done
    async function getUserRooms () {
        const req = await fetch (process.env.REACT_APP_BACKEND_URL + '/api/get-rooms', {
            headers: {
                'x-access-token': Cookies.get('token')
            }
        });

        const data = req.json();
        console.log(data);
    };

    const createRoom = () => {
        const new_id = uuid();
        toast.success('Creating a new Room...');
        navigate( `/room/${new_id}`, {
            state: { username }
        });
    };

    const joinRoom = () => {
        navigate('/join-room');
    }

  return (
    <section className='start-options'>
    <button onClick={ createRoom } style={{ backgroundColor: '#99f' }}>Create Room</button>
    <button onClick={ joinRoom } >Join Room</button>
    </section>
)
}

export default DashboardRoom