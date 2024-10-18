import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import BoardStudent from './dashboard/BoardStudent';
import BoardProfessor from './dashboard/BoardProfessor';
import { getToken } from './validator';

function Dashboard() {
    const [auth, getAuth] = useState(getToken(Cookies.get('token')));

    useEffect(() => {
        document.title = 'Dashboard · PnCode: Real-Time Collaborative Coding Website for College of Computing Studies Department of University of Cabuyao PNC(UC)';
    },[]);
   
    return (
        <>
            {auth.position === 'Student' &&
                <BoardStudent auth={auth}/> 
            }
            {auth.position === 'Professor' &&
                <BoardProfessor auth={auth}/>
            }
        </>
    );
}
  
export default Dashboard;