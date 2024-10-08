import toast from 'react-hot-toast';
import api from '../api';
import Cookies from 'js-cookie';
import errorHandler from '../error';

export default class Admin {
    constructor(admin_uid, first_name, last_name) {
        this.admin_uid = admin_uid;
        this.first_name = first_name;
        this.last_name = last_name;
    }

    async getAllStudents() {
        try {
            const response = await api.post('/api/admin/students');

            const data = response.data;

            if (data.status === 'ok') {
                return data.students;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
    
    async getAllProfessors() {
        try {
            const response = await api.post('/api/admin/professors');

            const data = response.data;

            if (data.status === 'ok') {
                return data.professors;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getAllCourses() {
        try {
            const response = await api.get('/api/admin/courses');

            const data = response.data;

            if (data.status === 'ok') {
                return data.courses;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getAllClasses() {
        try {
            const response = await api.post('/api/admin/classes');

            const data = response.data;

            if (data.status === 'ok') {
                return data.classes;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getAllTeams() {
        try {
            const response = await api.post('/api/admin/teams');

            const data = response.data;

            if (data.status === 'ok') {
                return data.teams;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async getAllActivities() {
        try {
            const response = await api.get('/api/admin/activities');

            const data = response.data;

            if (data.status === 'ok') {
                return data.activities;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    // async getAllSoloRooms() {
    //     try {
    //         const response = await api.get('/api/admin/solo-rooms');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.solo_rooms;
    //         }
    // return null;
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }

    // async getAllAssignedRooms() {
    //     try {
    //         const response = await api.get('/api/admin/assigned-rooms');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.assigned_rooms;
    //         }
    // return null;
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }

    // async getAllFiles() {
    //     try {
    //         const response = await api.get('/api/admin/files');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.files;
    //         }
    // return null;
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }

    // async getAllAdmins() {
    //     try {
    //         const response = await api.get('/api/admin/admins');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.admins;
    //         }
    // return null;
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }
    

    async createStudent(email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/create-student', {
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.uid;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateStudent(uid, email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/update-student', {
                uid,
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
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

    async createProfessor(email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/create-professor', {
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.uid;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateProfessor(uid, email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/update-professor', {
                uid,
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
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

    async createCourse(course_code, course_title) {
        try {
            const response = await api.post('/api/admin/create-course', {
                course_code,
                course_title
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.course_code;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateCourse(old_course_code, new_course_code, course_title) {
        try {
            const response = await api.post('/api/admin/update-course', {
                old_course_code,
                new_course_code,
                course_title
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

    async createClass(course_code, section, professor_uid) {
        try {
            const response = await api.post('/api/admin/create-class', {
                course_code,
                section,
                professor_uid,
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.class_id;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateClass(class_id, course_code, section, professor_uid) {
        try {
            const response = await api.post('/api/admin/update-class', {
                class_id,
                course_code,
                section,
                professor_uid,
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

    async addStudent(class_id, uid) {
        try {
            const response = await api.post('/api/admin/add-student', {
                class_id,
                uid
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

    async acceptRequest(class_id, uid) {
        try {
            const response = await api.post('/api/admin/accept-request', {
                class_id,
                uid
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

    async rejectRequest(class_id, uid) {
        try {
            const response = await api.post('/api/admin/reject-request', {
                class_id,
                uid
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

    async removeStudent(class_id, uid) {
        try {
            const response = await api.post('/api/admin/remove-student', {
                class_id,
                uid
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

    async createTeam(class_id, team_name) {
        try {
            const response = await api.post('/api/admin/create-team', {
                class_id,
                team_name,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.team_id;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateTeam(team_id, team_name) {
        try {
            const response = await api.post('/api/admin/update-team', {
                team_id,
                team_name,
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

    async getClassStudents(class_id) {
        try {
            const response = await api.post('/api/admin/get-class-students', {
                class_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.students;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async addMember(team_id, uid) {
        try {
            const response = await api.post('/api/admin/add-member', {
                team_id,
                uid
            });
    
            const data = response.data;
    
            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch(e) {
            errorHandler(e);
            return null;
        }
    }
    
    async removeMember(team_id, uid) {
        try {
            const response = await api.post('/api/admin/remove-member', {
                team_id,
                uid
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

    async createActivity(class_id, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/admin/create-activity', {
                class_id,
                activity_name,
                instructions,
                open_time,
                close_time
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.activity_id;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateActivity(activity_id, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/admin/update-activity', {
                activity_id,
                activity_name,
                instructions,
                open_time,
                close_time
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

    async deleteCourse(course_code) {
        try {
            const response = await api.post('/api/admin/delete-course', {
                course_code
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

    async deleteClass(class_id) {
        try {
            const response = await api.post('/api/admin/delete-class', {
                class_id
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

    async deleteTeam(team_id) {
        try {
            const response = await api.post('/api/admin/delete-team', {
                team_id
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