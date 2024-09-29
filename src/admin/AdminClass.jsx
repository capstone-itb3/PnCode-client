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
        } catch (e) {
            errorHandler(e);
            console.log(e);
            return null;
        }
    }

    async getAllSections() {
        try {
            const response = await api.post('/api/admin/sections');

            const data = response.data;

            if (data.status === 'ok') {
                return data.sections;
            }
        } catch (e) {
            errorHandler(e);
            console.log(e);
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
        } catch (e) {
            errorHandler(e);
            console.log(e);
            return null;
        }
    }

    // async getAllActivities() {
    //     try {
    //         const response = await api.get('/api/admin/activities');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.activities;
    //         }
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }

    // async getAllSoloRooms() {
    //     try {
    //         const response = await api.get('/api/admin/solo-rooms');

    //         const data = response.data;

    //         if (data.status === 'ok') {
    //             return data.solo_rooms;
    //         }
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
    //     } catch (e) {
    //         errorHandler(e);
    //         return null;
    //     }
    // }
}