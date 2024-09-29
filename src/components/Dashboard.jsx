import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import Header from './dashboard/Header';
import BoardStudent from './dashboard/BoardStudent';
import BoardProfessor from './dashboard/BoardProfessor';
import { getToken } from './validator';

function Dashboard() {
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));
    const [headerName, setHeaderName] = useState(null);


    useEffect(() => {
        document.title = 'Dashboard · PnCode';
    },[]);
   
    return (
        <>
            <Header auth={auth} base={'Dashboard'} name={headerName} />
            {
                ( auth.position === 'Student' &&
                <BoardStudent auth={auth} setHeaderName={setHeaderName}/> ) 
                ||
                ( auth.position === 'Professor' &&
                <BoardProfessor auth={auth} setHeaderName={setHeaderName}/> )
            }
        </>
    );
}
  
export default Dashboard;