import toast from 'react-hot-toast'
import api from '../api'
import { errorHandler, errorHandlerForms } from '../error'

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

    async updateRoomName(new_room_name) {
        try {
            const response = await api.post('/api/update-room-solo/', {
                room_id: this.room_id,
                room_name: new_room_name,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async deleteRoom() {
        try {
            const response = await api.post('/api/delete-room-solo/', {
                room_id: this.room_id,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
}

export class AssignedRoom extends Room {
    constructor (room_id, room_name, owner_id, activity_id) {
        super(room_id, room_name, owner_id);
        this.activity_id = activity_id;
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

    async reactToFeedback(socket, createdAt, uid) {
        try {
            socket.emit('react_to_feedback', {
                room_id: this.room_id,
                createdAt: createdAt,
                user_id: uid,
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