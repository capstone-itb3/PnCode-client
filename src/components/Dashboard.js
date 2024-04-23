import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './dashboard/Header';
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