import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Student, Professor } from '../classes/UserClass';

function restrictStudent() {
    const token = Cookies.get('token');
    if (token) {
        const auth = getToken(token);
        if (auth && auth?.position === 'Student') {
            return true;
        }
    }
    return false;
}

function getToken(token) {
    if (!token) {
        return removeAccess();
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
        }
    }
    return removeAccess();
}

function removeAccess() {
    window.location.href = '/login';
    return null;
}

export { restrictStudent, getToken, getClass };