import toast from 'react-hot-toast'

export class Room {
    constructor (room_id, room_name, owner_id) {
        this.room_id = room_id;
        this.room_name = room_name;
        this.owner_id = owner_id;
    }

}

export class SoloRoom extends Room {
    constructor (room_id, room_name, owner_id, files) {
        super(room_id, room_name, owner_id);
        this.files = files;
    }
}

export class AssignedRoom extends Room {
    constructor (room_id, room_name, owner_id, activity_id, notes) {
        super(room_id, room_name, owner_id);
        this.activity_id = activity_id;
        this.notes = notes        
    }

    async submitFeedback(socket, feedback, uid) {
        try {
            socket.emit('submit_feedback', {
                room_id: this.room_id,
                user_id: uid,
                new_feedback: feedback,
            });

        } catch (e) {
            console.error('Unable to connect to the server.');
            toast.error('Unable to connect to the server.');
        }
    }

    async deleteFeedback(socket, createdAt) {
        try {
            socket.emit('delete_feedback', {
                room_id: this.room_id,
                createdAt: createdAt,
            });
        } catch (e) {
            console.error('Unable to connect to the server.');
            toast.error('Unable to connect to the server.');
        }
    }
}