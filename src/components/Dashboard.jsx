import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './dashboard/Header';
import StudentBoard from './dashboard/StudentBoard';
import ProfessorBoard from './dashboard/ProfessorBoard';

function Dashboard() {
    const navigate = useNavigate();
    const { select } = useParams();
    const [auth, setAuth] = useState(() => {
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/login';
            return null;
        }
      
        try {
            const user = jwtDecode(token);
            return user;
        } catch (error) {
            console.error('Invalid token: ', error);
            Cookies.remove('token');
            window.location.href = '/login';
            return null;
        }
    });

    useEffect(() => {
        if (select) {   
            checkParams(select);
        } 
    },[]);

    const checkParams = (selected) => {
        const separator = document.querySelectorAll('.separator');
        const show = document.getElementById(`show-${selected}`);

        const options = document.querySelectorAll('.sb-ops');
        const clicked = document.getElementById(`sb-${selected}`);
        
        options.forEach(value => value.classList.remove('selected'));
        clicked.classList.add('selected');

        if (selected === 'all') {
          separator.forEach(value => value.style.display = 'block');
        } else {
          separator.forEach(value => value.style.display = 'none');
          show.style.display = 'block';
        }
    }

    if (!auth) {
        return <div>Loading...</div>;
    }
   
    return (
        <div>
            <Header auth={auth} />
            {
                ( auth.position === 'Student' &&
                <StudentBoard auth={auth} checkParams={checkParams}/> ) 
                ||
                ( auth.position === 'Professor' &&
                <ProfessorBoard auth={auth} checkParams={checkParams}/> )
            }
        </div>
    );
}
  
export default Dashboard;