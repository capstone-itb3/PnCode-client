import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuid } from 'uuid';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from './dashboard/Header';
import Cookies from 'js-cookie';
import Sidebar from './dashboard/Sidebar';
import DashboardRoom from './dashboard/DashboardRoom';
import DashboardTeam from './dashboard/DashboardTeam';
import DashboardClass from './dashboard/DashboardClass';

function Dashboard () {
    const navigate = useNavigate();
    const { select } = useParams();
    const [auth, setAuth] = useState(() => {
        const token = Cookies.get('token');
        if(token !== null) {
            const user = jwtDecode(token);
            if(!user) {
                Cookies.remove('token');
                navigate('/login');
            } else {
                return user;
            }
        } else {
            navigate('/login');
        }
    });

    useEffect(() => {
        console.log(auth);
        console.log(auth.username);
    });

    let main;
    if(select === 'teams') {
        main = <DashboardTeam auth={ auth }/>;
    } else if (select === 'classes') {
        main = <DashboardClass auth={ auth }/>
    } else {
        main = <DashboardRoom auth={ auth }/>
    }

    return (
        <div>
            <Header auth={ auth }/>
            <Sidebar/>
            <main id='dashboard-main'>
                    {main}
            </main>
        </div>
    );
}

export default Dashboard;