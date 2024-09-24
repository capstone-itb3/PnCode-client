import toast from 'react-hot-toast';
import api from '../api';
import errorHandler from '../error';

export default class Team {
    constructor (team_id, team_name, course, section, members) {
        this.team_id = team_id;
        this.team_name = team_name; 
        this.course = course;
        this.section = section;
        this.members = members;
    }

    async addMember(student) {
        try {
            const response = await api.post('/api/add-member', {
                team_id: this.team_id,
                student_uid: student.uid,
                course: this.course,
                section: this.section,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(`Student successfully added to ${this.team_name}.`);
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;            
        }
    }

    async removeMember(uid) {
        try {
            const response = await api.post('/api/remove-member', {
                team_id: this.team_id,
                student_uid: uid,
                course: this.course,
                section: this.section,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(data.message);
            }

        } catch (e) {
            errorHandler(e);
        }
    }

    async deleteTeam() {
        try {
            const response = await api.post('/api/delete-team', {
                team_id: this.team_id,
                course: this.course,
                section: this.section,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
}