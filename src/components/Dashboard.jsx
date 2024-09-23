import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Header from './dashboard/Header';
import BoardStudent from './dashboard/BoardStudent';
import BoardProfessor from './dashboard/BoardProfessor';
import { getToken } from './validator';

function Dashboard() {
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));

    useEffect(() => {
        document.title = 'Dashboard · PnCode';
    },[]);
   
    return (
        <>
            <Header auth={auth} base={'Dashboard'} name={null}/>
            {
                ( auth.position === 'Student' &&
                <BoardStudent auth={auth} /> ) 
                ||
                ( auth.position === 'Professor' &&
                <BoardProfessor auth={auth} /> )
            }
        </>
    );
}
  
export default Dashboard;