import toast from 'react-hot-toast'

export class Room {
    constructor (room_id, room_name, room_type, owner_id) {
        this.room_id = room_id;
        this.room_name = room_name;
        this.room_type = room_type;
        this.owner_id = owner_id;
    }

}

export class SoloRoom extends Room {
    constructor (room_id, room_name, room_type, owner_id, code) {
        super(room_id, room_name, room_type, owner_id);
        this.code = code;
    }

    async saveProgram(code) {
        try {
            console.log(code);
            console.log(`${import.meta.env.VITE_APP_BACKEND_URL}/api/solo-update-code`);

            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/solo-update-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    room_id: this.room_id,
                    code
                })
            });
            
            const data = await response.json();

            if (!data.status) {
                toast.error('Unable to connect to the server');
            } else {
                toast.success('Code saved successfully');
            }
        } catch (e) {
            console.error('Unable to connect to the server.');
            toast.error('Unable to connect to the server.');
        }
    }
}

export class AssignedRoom extends Room {
    constructor (room_id, room_name, room_type, owner_id, activity_id, files, notes, feedback, chat) {
        super(room_id, room_name, room_type, owner_id);
        this.activity_id = activity_id;
        this.files = files;
        this.notes = notes        
        this.feedback = feedback;
        this.chat = chat;
    }
}