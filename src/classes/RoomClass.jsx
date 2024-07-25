export class Room {
    constructor (room_id, room_name, room_type, files, notes) {
        this.room_id = room_id;
        this.room_name = room_name;
        this.room_type = room_type;
        this.files = files;
        this.history = history;
        this.notes = notes;
    }

}

export class SoloRoom extends Room {
    constructor (room_id, room_name, room_type, files, notes, owner_id) {
        super(room_id, room_name, room_type, files, notes);
        this.owner_id = owner_id;
    }
}

export class AssignedRoom extends Room {
    constructor (room_id, room_name, room_type, files, notes, group_id, assigned, feedback, chat) {
        super(room_id, room_name, room_type, files, notes);
        this.group_id = group_id;
        this.assigned = assigned;
        this.feedback = feedback;
        this.chat = chat;
    }
}