import './RoomClass.jsx';
import './TeamClass.jsx';
import toast from'react-hot-toast';
import Cookies from 'js-cookie';

export class User {
    constructor(uid, email, first_name, last_name, position, preferences) {
        this.uid = uid;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.position = position;
        this.preferences = preferences;
    }

    async getTeams(course, section) {
        try {
            const getUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/api/get-teams/?course=${course}&section=${section}`;
            
            const response = await fetch(getUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (data.status === 'ok') {
                return data.teams;
            } else {
                toast.error('Error. Retrieving teams failed.');
                return null;
            }
        } catch (error) {
            toast.error('Error. Retrieving teams failed.');
            console.error(error);
            return null;
        }
    }

    async getSoloRooms() { 
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-solo-rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    email: this.email,
                    timezone_diff: new Date().getTimezoneOffset()
                })
            });
        
            const data = await response.json();
        
            if (data.status === 'ok') {
                return data.solo_rooms;
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

    async createSoloRoom() {
        toast.success('Redirecting you to a new Room...');
    
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/create-room-solo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    email: this.email,
                    position: this.position
                })
            });
        
            const data = await response.json();

            if (data.status === 'ok') {
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

    async getCourseStudents(course, section) {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-included-students/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: this.uid,
                course,
                section
            })
        });
        const data = await response.json();

        if (data.status === 'ok') {
            return data.students;
        } else {
            alert(data.message);
            console.error(data.message);
        }
    }

    async createTeam(name, course, section, members) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/create-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    position: this.position,
                    name,
                    course,
                    section,
                    members
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success('Team created successfully.');
                
                window.location.reload();
            } else {
                toast.error('Error. Team creation failed.');
                return null;
            }
        } catch (e) {
            console.log(e);
        }
    }
}
  
export class Student extends User {
    constructor(uid, email, first_name, last_name, position, preferences, section, enrolled_courses) {
        super(uid, email, first_name, last_name, position, preferences);
        this.section = section;
        this.enrolled_courses = enrolled_courses;
    }

    async reloadStudentData() {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/reload-student-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    position: this.position
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                Cookies.set('token', data.token, { expires : 90 });
            } else {
                alert('There\' is a problem in reloading your data. Please log in again');
            }
        } catch (e) {
            alert('There\' is a problem in reloading your data. Please log in again');
            console.error(e);
        }
    }

    async getJoinedTeams() {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-joined-teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    email: this.email,
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                return data.joined_teams;
            } else {
                toast.error('Error. Retrieving teams failed.');
                return null;
            }
        } catch (error) {
            toast.error('Error. Retrieving teams failed.');
            console.error(error);
            return null;
        }
    }

    async getAssignedRooms() { 
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-assigned-rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    email: this.email,
                    timezone_diff: new Date().getTimezoneOffset()
                })
            });
        
            const data = await response.json();
        
            if (data.status === 'ok') {
                return data.assigned_rooms;
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

    getEnrolledCourses() {
        return this.enrolled_courses;
    }

 
}

export class Professor extends User {
    constructor(uid, email, first_name, last_name, position, preferences, assigned_courses) {
        super(uid, email, first_name, last_name, position, preferences);
        this.assigned_courses = assigned_courses;
    }

    // create
}