import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function errorHandler(e) {
    if (e?.response && (e.response.status === 400 || e.response.status === 500)) {
        toast.error(e.response.data?.message);
        
    // } else if (e?.response && e.response.status === 401) {
    //     Cookies.remove('token');
    //     window.location.href = '/';
        
    } else {
        toast.error('Unable to connect to the server. Try again later.');
        console.error(e);
    }
}