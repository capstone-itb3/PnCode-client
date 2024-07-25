import './RoomClass.jsx';
import './TeamClass.jsx';
import toast from'react-hot-toast';
import Cookies from 'js-cookie';

export class User {
    constructor(first_name, last_name, position, solo_rooms, teams) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.position = position;
        this.solo_rooms = solo_rooms;
        this.teams = teams;
    }

    async getAllRooms() { 
        try {
            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/get-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    solo_rooms: this.solo_rooms,  
                    assigned_rooms: this.assigned_rooms,
                    timezone_diff: new Date().getTimezoneOffset()
                })
            });
        
            const data = await response.json();
        
            if (data.status === 'ok') {
                return data;
            } else {
                toast.error('Error. Retrieving rooms failed.');
                return null;
            }
        } catch (error) {
            toast.error('Error. Retrieving rooms failed.');
            console.error(error);
            return null;
        }
    }
}
  
export class Student extends User {
    constructor(student_id, first_name, last_name, year, section, position, solo_rooms, assigned_rooms, teams) {
        super(first_name, last_name, position, solo_rooms, teams);
        this.student_id = student_id;
        this.year = year;
        this.section = section;
        this.assigned_rooms = assigned_rooms;
    }

    async createSoloRoom() {
        toast.success('Redirecting you to a new Room...');
    
        try {
            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/create-room-solo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: this.student_id,
                    position: this.position
                })
            });
        
            const data = await response.json();

            if (data.status === 'ok') {
                Cookies.set('token', data.token);
                window.location.href = `/solo/${data.room_id}`;

            } else {
                toast.error('Internal server error. Please try again later.');
                console.error(data.message);
            }
        } catch (e) {
            toast.error('Internal server error. Please try again later.');
            console.error(e);
        }
    }

    async createTeam() {
        

    }
}

export class Professor extends User {
    constructor(email, first_name, last_name, position, solo_rooms, room_groups, teams, ) {
        super(first_name, last_name, position, solo_rooms, teams, );
        this.email = email;
        this.room_groups = room_groups;
    }
}