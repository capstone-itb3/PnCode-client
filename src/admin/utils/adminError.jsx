import toast from 'react-hot-toast';

export function errorHandlerAdmin(e) {
    console.error(e.message);
    
    if (e?.response && (e.response.status === 400 || e.response.status === 500)) {
        toast.error(e.response.data?.message);
        
    } else if (e?.response && (e.response.status === 404 || e.response.status === 403)) {
        alert(`404 Error. ${e.response.data?.message}`);
        window.history.back();
        
    } else if (e?.response && e.response.status === 401) {
        window.location.href = '/error/404';

    } else {
        toast.error('Unable to connect to the server. Try again later.');
    }
}