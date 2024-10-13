import toast from'react-hot-toast';
import Team from './TeamClass';
import Activity from './ActivityClass';
import { SoloRoom, AssignedRoom } from './RoomClass';
import api from '../api';
import Cookies from 'js-cookie';
import { errorHandler } from '../error';

export class User {
    constructor(uid, first_name, last_name, position) {
        this.uid = uid;
        this.first_name = first_name;
        this.last_name = last_name;
        this.position = position;
    }

    async getCourseDetails(class_id) {
        try {
            const response = await api.get('/api/get-course-details/', {
                params: {
                    class_id
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

    async getCourseStudents(class_id, list) {
        try {
            const response = await api.post('/api/get-included-students/', {
                class_id,
                list
            });
            const data = response.data;
    
            if (data.status === 'ok' && list === 'students') {
                return data.students;
            } else if (data.status === 'ok' && list === 'all') {
                return { students: data.students, requests: data.requests };
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getTeams(class_id) {
        try {
            const response = await api.get('/api/get-teams/', {
                params: {
                    class_id
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

    async getActivities(class_id) {
        try {
            const response = await api.get('/api/get-activities', {
                params: {
                    class_id
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

    async createTeam(team_name, class_id) {
        try {
            console.log(class_id);

            const response = await api.post('/api/create-team', {
                name: team_name,
                class_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.team_id;
            } else if (data.reload) {
                toast.error('You have already been on a team.');
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
        
                return { team_class: new Team(
                            info.team_id, 
                            info.team_name, 
                            info.class_id,
                            info.members 
                            ), 
                            access: data.access,
                            course_code: data.course_code,
                            section: data.section,
                        };

            } else {
                window.location.href = '/error/404';
            }
        } catch (e) {
            errorHandler(e);
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
                    info.owner_id,
                    info.files
                );
            }
        } catch (e) {
            errorHandler(e);
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
                        info.owner_id,
                        info.activity_id,
                    ), 
                    files: data.files, 
                    activity: data.activity, 
                    members: data.members, 
                    access: data.access 
                };
            }
            return null;
        } catch (e) {
            errorHandler(e);
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

    changeTheme(theme) {
        Cookies.set('theme', theme);
    }
}

export class Student extends User {
    constructor(uid, first_name, last_name, position) {
        super(uid, first_name, last_name, position);
    }

    async getEnrolledClasses() {
        try {
            const response = await api.post('/api/get-enrolled-classes');

            const data = response.data;

            if (data.status === 'ok') {
                return data.classes;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async visitActivity(activity_id, class_id) {
        try {
            const response = await api.get('/api/visit-activity', {
                params: {
                    activity_id,
                    class_id
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

    async requestCourse(course_code, section) {
        try {
            const response = await api.post('/api/request-course', {
                course_code,
                section
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
        } catch(e) {
            errorHandler(e);
            return null
        }
    }
}

export class Professor extends User {
    constructor(uid, first_name, last_name, position) {
        super(uid, first_name, last_name, position);
    }

    async getAssignedClasses() {
        try {
            const response = await api.post('/api/get-assigned-classes');

            const data = response.data;

            if (data.status === 'ok') {
                console.log(data.classes);
                return data.classes;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async acceptRequest(class_id, uid) {
        try {
            const response = await api.post('/api/accept-request', {
                class_id,
                uid
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success('Student accepted successfully.');
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async rejectRequest(class_id, uid) {
        try {
            const response = await api.post('/api/reject-request', {
                class_id,
                uid
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success('Student is rejected from the class.');
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async removeStudent(class_id, uid) {
        try {
            const response = await api.post('/api/remove-student', {
                class_id,
                uid
            });
            const data = response.data;

            if (data.status === 'ok') {
                toast.success('Student is removed from the class.');
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async createActivity(class_id, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/create-activity', {
                class_id,
                activity_name,
                instructions,
                open_time,
                close_time,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.activity_id;
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

            if (data.status === 'ok') {
                const info = data.activity;

                return {
                    activity_class: new Activity(
                        info.activity_id,
                        info.activity_name,
                        info.class_id,
                        info.instructions,
                        info.open_time,
                        info.close_time,
                    ),
                    rooms: data.rooms,
                    course_code: data.course_code,
                    section: data.section
                };
            }
        } catch (e) {
            errorHandler(e);
        }
    }
}