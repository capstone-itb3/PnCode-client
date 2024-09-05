import toast from'react-hot-toast';
import Cookies from 'js-cookie';
import Team from './TeamClass';
import Activity from './ActivityClass';
import { SoloRoom, AssignedRoom } from './RoomClass';

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

    async createTeam(team_name, course, section) {
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
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success('Team created successfully.');
                window.location.reload();
            } else {
                toast.error(data.message ? data.message : 'Server connection error.');
                if (data.reload) {
                    windoes.location.reload();
                }
            }
        } catch (e) {
            console.log(e);
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

    async getTeamDetails(auth, team_id) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-team-details/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth: auth,
                    team_id: team_id
                })
            });
        
            const data = await response.json();
            
            if (data.status === 'ok' && data.access) {
                const info = data.team;
        
                return { team_class : new Team(
                            info.team_id, 
                            info.team_name, 
                            info.course, 
                            info.section, 
                            info.members ), 
                            access : data.access 
                        };
            } else {
                window.location.href = '/dashboard';
                return null;
            }    
        } catch (e) {
            console.error(e);
            window.location.href = '/dashboard';
        }
    }

    async getSoloRoomDetails(room_id) {
        try {
            const getUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/api/get-solo-room-details/?room_id=${room_id}`;

            const response = await fetch(getUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (data.status === 'ok' && data.solo_room.owner_id === this.uid) {
                const info = data.solo_room;

                return new SoloRoom(
                    info.room_id,
                    info.room_name,
                    info.room_type,
                    info.owner_id,
                    info.code
                );
            } else {
                // window.location.href = '/dashboard';
                return null;
            }
        } catch (error) {
            toast.error('Error. Retrieving room details failed.');
            console.error(error);
            return null;
        }
    }  

    async viewOutput(room_id, file_name) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/view-output`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    room_id,
                    file_name,
                    uid: this.uid,
                    position: this.position
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                return { files: data.files, active: data.active };
            } else {
                console.error(data.message);
                return null;
            }
        } catch (error) {
            console.error(error);
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

    async visitActivity(activity_id, course, section) {
        try {
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
                window.location.href = `/room/${data.room_id}`;

            } else {
                alert(data.message);
                console.log(data.message);
            }
            
        } catch (e) {
            toast.error('Error. Accessing activity failed. Please reload the page');
            console.error(e);
        }
    }    

    async getAssignedRoomDetails (room_id) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-assigned-room-details-for-student/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    room_id
                })
            });

            const data = await response.json();

            if (data.status === 'ok' && data.access) {
                const info = data.room;

                return { room: new AssignedRoom(
                    info.room_id,
                    info.room_name,
                    info.room_type,
                    info.owner_id,
                    info.activity_id,
                    info.files,
                    info.notes,
                    info.feedback,
                    info.chat
                ), activity: data.activity, 
                   members: data.members, 
                   access: data.access };
            } else {
                // window.location.href = '/dashboard';
                // return null;
            }
        } catch(e) {
            console.error(e);
            // window.location.href = '/dashboard';
            // return null;
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

    async getActivityDetails(auth, activity_id) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/get-activity-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    auth: auth,
                    activity_id: activity_id
                })
            });

            const data = await response.json();

            if (data.status === 'ok' && data.access) {
                const info = data.activity;

                return {activity_class: new Activity(
                    info.activity_id,
                    info.activity_name,
                    info.course_code,
                    info.section,
                    info.instructions,
                    info.open_time,
                    info.close_time,
                    info.deadline,
                ), rooms: data.rooms};
            } else {
                window.location.href = '/dashboard';
                return null;
            }
        } catch (e) {
            console.error(e);
            window.location.href = '/dashboard';
        }
    }
}