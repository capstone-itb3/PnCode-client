import './RoomClass.jsx';
import './TeamClass.jsx';
import './ActivityClass.jsx';
import toast from'react-hot-toast';
import Cookies from 'js-cookie';

export class User {
    constructor(uid, email, first_name, last_name, position, notifications, preferences) {
        this.uid = uid;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.position = position;
        this.notifications = notifications;
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

    async getActivities(course, section) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    course,
                    section
                })
            });

            const data = await response.json();
            
            if (data.status === 'ok') {
                return data.activities;
            } else {
                toast.error('Error. Retrieving activities failed.');
                return null;
            }
            
        } catch (e) {
            alert('Error. Retrieving activities failed.');
            console.error(e);
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

    async createTeam(team_name, course, section, members) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/create-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    position: this.position,
                    uid: this.uid,
                    name: team_name,
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
    constructor(uid, email, first_name, last_name, position, notifications, preferences, section, enrolled_courses) {
        super(uid, email, first_name, last_name, position, notifications, preferences);
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

    async getCourseProfessor(course_code, section) {
        try {
            const getUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/api/get-course-professor/?course_code=${course_code}&section=${section}`;

            const response = await fetch(getUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (data.status === 'ok') {
                return data.name;
            } else {
                alert(data.message);
                console.error('Internal server error. Please try again later.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Connection error. Please try again later.');
        }
    }
    async visitActivity(activity_id, course) {
        try {
            let section = null;

            for (let i = 0; i < this.enrolled_courses.length ; i++) {
                if (this.enrolled_courses[i].course_code === course) {
                    section = this.enrolled_courses[i].section;

                    break;
                }
            }

            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/visit-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    activity_id,
                    course,
                    section
                })
            });

            const data = await response.json();
            
            if (data.status === 'ok') {
                toast.success('Redirecting you to your team\'s assigned room...');
                window.location.href = `/room/${activity_id}`;

            } else {
                toast.error(data.message);
                console.error(data.message);
            }
            
        } catch (e) {
            toast.error('Error. Accessing activity failed. Please reload the page');
            console.error(e);
        }
    }    
}

export class Professor extends User {
    constructor(uid, email, first_name, last_name, position, notifications, preferences, assigned_courses) {
        super(uid, email, first_name, last_name, position, notifications, preferences);
        this.assigned_courses = assigned_courses;
    }

    async createActivity(course, section, activity_name, instructions, open_time, close_time, deadline) {
        try {

            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/create-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    course,
                    section,
                    activity_name,
                    instructions,
                    open_time,
                    close_time,
                    deadline,
                })
            });


            const data = await response.json();

            if (data.status === 'ok') {
                toast.success('Activity created successfully.');
                window.location.reload();

            } else {
                toast.error(data.error || 'Error. Activity creation failed.');
                return null;
            }
        } catch (e) {
            console.log(e);
        }
    }
}