import toast from 'react-hot-toast';

function findHTMLInFiles(room_id, room_files, isSolo) {
    const active =  room_files.find((f) => f.type = 'html');

    if (active) {
        return `${import.meta.env.VITE_APP_BACKEND_URL}/view/${isSolo || ''}${room_id}/${active.name}`
    } else {
        return null;
    }
}

export function runOutput(output, room_id, room_files, activeFile, isSolo) {
    if (!output) {
        return;
    }

    if (activeFile.type === 'html') {
        output.src = `${import.meta.env.VITE_APP_BACKEND_URL}/view/${isSolo || ''}${room_id}/${activeFile.name}`;

    } else {
        output.src = null;
        setTimeout(() => {
            const html = findHTMLInFiles(room_id, room_files, isSolo);
            output.src = html;
    
            !html ? toast.error('No HTML file found.') : null;
        }, 200);
        
    }    
}

export function runOutputFullView(room_id, room_files, activeFile, isSolo) {
    if (!activeFile || room_files.length === 0) {
        toast.error('Please select a file first.');
        return;
    }

    if (activeFile.type === 'html') {
        window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/view/${isSolo || ''}${room_id}/${activeFile.name}`;

    } else {
        const html = findHTMLInFiles(room_id, room_files, isSolo);
        html ? window.location.href = html : `${import.meta.env.VITE_APP_BACKEND_URL}/view/${isSolo || ''}${room_id}/${activeFile.name}`;
    }
}
