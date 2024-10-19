import toast from 'react-hot-toast';
import { showAlertPopup } from './components/reactPopupService';

export async function errorHandler(e) {
    console.error(e.message);
    
    if (e?.response && (e.response.status === 400 || e.response.status === 500)) {
        await showAlertPopup({
            title: 'Error',
            message: e.response.data?.message,
            type: 'error',
            okay_text: 'Okay'
        });

    } else if (e?.response && (e.response.status === 404 || e.response.status === 403)) {
        window.location.href = '/error/404';
        
    } else if (e?.response && e.response.status === 401) {
        window.location.href = '/error/404';

    } else {
        toast.error('Unable to connect to the server. Try again later.');
    }
}

export async function errorHandlerForms(e) {
    console.error(e.message);

    if (e?.response && e.response.status === 404) {
        await showAlertPopup({
            title: 'Resource Not Found',
            message: e.response.data?.message,
            type: 'error',
            okay_text: 'Okay'
        });
    
    } else if (e?.response && e.response.status === 401) {
        window.location.href = '/';

    } else if (e?.response && e?.response.status >= 400) {
        toast.error(e.response.data?.message);
        
    } else {
        toast.error('Unable to connect to the server. Try again later.');
    }
}