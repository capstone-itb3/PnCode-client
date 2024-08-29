import React, { useState } from 'react'
import Cookies from 'js-cookie';
import { getToken } from './validator';
import RoomStudent from './room/RoomStudent';
import RoomProfessor from './room/RoomProfessor';

function Room() {
    const [auth, setAuth] = useState(getToken(Cookies.get('token')));

    return (
        <>
            {auth && auth.position === 'Student' && <RoomStudent auth={auth}/>}
            {auth && auth.position === 'Professor' && <RoomProfessor auth={auth}/>}
        </>
    )
}

export default Room