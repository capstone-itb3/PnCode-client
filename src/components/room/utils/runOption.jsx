import toast from 'react-hot-toast';

function findHTMLInFiles(room_id, room_files) {
    const active =  room_files.find((f) => f.type = 'html');

    if (active) {
        return `${import.meta.env.VITE_APP_BACKEND_URL}/view/${room_id}/${active.name}`
    } else {
        return null;
    }
}

export function runOutput(output, room_id, room_files, activeFile) {
    if (!output) {
        return;
    }

    if (activeFile.type === 'html') {
        output.src = `${import.meta.env.VITE_APP_BACKEND_URL}/view/${room_id}/${activeFile.name}`;

    } else {
        const html = findHTMLInFiles(room_id, room_files);
        output.src = html;

        !html ? toast.error('No HTML file found.') : null;
    }    
}

export function runOutputFullView(room_id, room_files, activeFile) {
    if (!activeFile || room_files.length === 0) {
        toast.error('Please select a file first.');
        return;
    }

    if (activeFile.type === 'html') {
        window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/view/${room_id}/${activeFile.name}`;

    } else {
        const html = findHTMLInFiles(room_id, room_files);
        html ? window.location.href = html : `${import.meta.env.VITE_APP_BACKEND_URL}/view/${room_id}/${activeFile.name}`;
    }
}