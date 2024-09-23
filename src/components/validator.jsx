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
    } catch (e) {
        return removeAccess();
    }    
}

function getClass(auth, position) {
    if (auth.position === position) {
        switch (position) {

        case 'Student':
            return new Student(
                    auth.uid,
                    auth.first_name,
                    auth.last_name,
                    auth.position,
            );

        case 'Professor':
            return new Professor(
                auth.uid, 
                auth.first_name, 
                auth.last_name, 
                auth.position, 
            );

        default:
            return removeAccess();
        }            
    } else {
        return removeAccess();
    }
}

function removeAccess() {
    Cookies.remove('token');
    window.location.href = '/login';
    return null;
}

export {
            getToken,
            getClass,
        };