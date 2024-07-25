export class Editor {
    constructor (editor_id, editor_name, room_id, code, history) {
        this.editor_id = editor_id;
        this.editor_name = editor_name;
        this.room_id = room_id;
        this.code = code;
        this.history = history;
    }
}