import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Student, Professor } from '../classes/UserClass';
function getToken(token) {
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
}

function getClass(auth, position) {
    if (auth.position === position) {
        switch (position) {

        case 'Student':
            return new Student(
                    auth.uid,
                    auth.email,
                    auth.first_name,
                    auth.last_name,
                    auth.position,
                    auth.notifications,
                    auth.preferences,
                    auth.section,
                    auth.enrolled_courses,
            );

        case 'Professor':
            return new Professor(
                auth.uid, 
                auth.email, 
                auth.first_name, 
                auth.last_name, 
                auth.position, 
                auth.notifications,
                auth.preferences,
                auth.assigned_courses, 
            );

        default:
            window.location.href = '/login';
            return null;
        }            
    } else {
        window.location.href = '/login';
        return null;
    }
}

export {
    getToken,
    getClass,
};