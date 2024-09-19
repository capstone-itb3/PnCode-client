import toast from'react-hot-toast';
import Cookies from 'js-cookie';
import Team from './TeamClass';
import Activity from './ActivityClass';
import { SoloRoom, AssignedRoom } from './RoomClass';
import api from '../api';
import errorHandler from '../error';

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

    async getCourseDetails(course_code, section) {
        try {
            const response = await api.get('/api/get-course-details/', {
                params: {
                    course_code,
                    section
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data;
            }
        } catch (e) {
            errorHandler(e);
        }
    }

    async getCourseStudents(course, section) {
        try {
            const response = await api.post('/api/get-included-students/', {
                    uid: this.uid,
                    course,
                    section
            });
            const data = response.data;
    
            if (data.status === 'ok') {
                return data.students;
            } 
        } catch (e) {
            errorHandler(e);
        }
    }

    async getTeams(course, section) {
        try {
            const response = await api.get('/api/get-teams/', {
                params: {
                    course,
                    section
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.teams;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getActivities(course, section) {
        try {
            const response = await api.get('/api/get-activities', {
                params: {
                    course,
                    section
                }
            });

            const data = response.data;
            
            if (data.status === 'ok') {
                return data.activities;
            }
            
        } catch (e) {
            errorHandler(e);
        }
    }

    async getSoloRooms() { 
        try {
            const response = await api.get('/api/get-solo-rooms', {
                params: {
                    timezone_diff: new Date().getTimezoneOffset()
                }
            });
        
            const data = response.data;
        
            if (data.status === 'ok') {
                return data.solo_rooms;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async createTeam(team_name, course, section) {
        try {
            const response = await api.post('/api/create-team', {
                name: team_name,
                course,
                section,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success('Team created successfully.');
                window.location.reload();
            }
        } catch (e) {
            errorHandler(e);
        }
    }

    async createSoloRoom() {        
        try {
            const response = await api.post('/api/create-room-solo');
            
            const data = response.data;

            if (data.status === 'ok') {
                return data.room_id;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getTeamDetails(team_id) {
        try {
            const response = await api.post('/api/get-team-details', {
                    team_id: team_id
            });
        
            const data = response.data;
            
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
            }
        } catch (e) {
            errorHandler(e);
            window.location.href = '/dashboard';
        }
    }

    async getSoloRoomDetails(room_id) {
        try {
            const response = await api.get('/api/get-solo-room-details/', {
                params: {
                    room_id
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                const info = data.room;

                return new SoloRoom(
                    info.room_id,
                    info.room_name,
                    info.room_type,
                    info.owner_id,
                    info.files
                );
            }
        } catch (e) {
            errorHandler(e);
            window.location.href = '/dashboard';
            return null;
        }
    }
    
    async getAssignedRoomDetails (room_id) {
        try {
            const response = await api.post('/api/get-assigned-room-details/', {
                room_id
            });

            const data = response.data;

            if (data.status === 'ok' && data.access) {
                const info = data.room;

                return { 
                    room: new AssignedRoom(
                        info.room_id,
                        info.room_name,
                        info.room_type,
                        info.owner_id,
                        info.activity_id,
                        info.notes,
                    ), 
                    files: data.files, 
                    activity: data.activity, 
                    members: data.members, 
                    access: data.access 
                };
            } else {
                window.location.href = '/dashboard';
                return null;
            }
        } catch (e) {
            errorHandler(e);
            window.location.href = '/dashboard';
            return null;
        }
    }    

    async viewOutput(room_id, file_name) {
        try {
            const response = await api.get('/api/view-output', {
                params: {
                    room_id,
                    file_name,
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                return { files: data.files, active: data.active };
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    changeTheme(socket, theme) {
        socket.emit('preferred_theme', {
            theme,
            user: this
        });
        
        this.preferences = { theme: theme };
        console.log(this.preferences)
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

    async visitActivity(activity_id, course, section) {
        try {
            const response = await api.get('/api/visit-activity', {
                params: {
                    activity_id,
                    course,
                    section
                }
            });

            const data = response.data;
            
            if (data.status === 'ok') {
                toast.success('Redirecting you to your team\'s assigned room...');
                window.location.href = `/room/${data.room_id}`;
            }
        } catch (e) {
            errorHandler(e);
        }
    }    
}

export class Professor extends User {
    constructor(uid, email, first_name, last_name, position, notifications, preferences, assigned_courses) {
        super(uid, email, first_name, last_name, position, notifications, preferences);
        this.assigned_courses = assigned_courses;
    }

    async createActivity(course, section, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/create-activity', {
                course,
                section,
                activity_name,
                instructions,
                open_time,
                close_time,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success('Activity created successfully.');
                window.location.reload();
            }
        } catch (e) {
            errorHandler(e);
        }
    }

    async getActivityDetails(activity_id) {
        try {
            const response = await api.get('/api/get-activity-details', {
                params: {
                    activity_id: activity_id
                }
            });

            const data = response.data;

            if (data.status === 'ok' && data.access) {
                const info = data.activity;

                return {
                    activity_class: new Activity(
                        info.activity_id,
                        info.activity_name,
                        info.course_code,
                        info.section,
                        info.instructions,
                        info.open_time,
                        info.close_time,
                    ),
                    rooms: data.rooms
                };
            } else {
                window.location.href = '/dashboard';
                return null;
            }
        } catch (e) {
            errorHandler(e);
            window.location.href = '/dashboard';
        }
    }
}