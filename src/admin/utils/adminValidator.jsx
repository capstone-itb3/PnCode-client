import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import Admin from '../AdminClass';

export default function getAdminClass() {
    const token = Cookies.get('token');

    if (!token) {
      window.location.href = '/login';
      return null;
    }

    try {
      const user = jwtDecode(token);
      
      if (user?.position === 'Student' || user?.position === 'Professor') {
        window.location.href = '/error/404';
        return null;
      }
      
      return new Admin(user.admin_uid, user.first_name, user.last_name);

    } catch (e) {
      window.location.href = '/login';
      return null;
    }    
}