import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Dashboard () {
    const navigate = useNavigate();
    const [username, setUsername] = useState();

    useEffect(() => {
        const auth = localStorage.getItem('token');
        if(auth !== null) {
            const user = jwtDecode(auth);
            if(!user) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                console.log('success');
                setUsername(user.username);
            }
        } else {
            navigate('/login');
        }
    });
    
    //* not yet done
    async function getUserRooms () {
        const req = await fetch (process.env.REACT_APP_BACKEND_URL + '/api/get-rooms', {
            headers: {
                'x-access-token': localStorage.getItem('token')
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
        <main className='dashboard-main'>
            <section className='start-options'>
                <button onClick={ createRoom } style={{ backgroundColor: '#99f' }}>Create Room</button>
                <button onClick={ joinRoom } >Join Room</button>
            </section>
        </main>
    );
}

export default Dashboard;