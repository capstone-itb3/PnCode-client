import toast from 'react-hot-toast';

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
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/add-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    team_id: this.team_id,
                    student_uid: student.uid,
                    course: this.course,
                    section: this.section,
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success(`Student successfully added to ${this.team_name}.`);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (e) {
            toast.error('Error. Adding student to team failed.');
            console.error(e);
            return false;            
        }
    }

    async removeMember(uid) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/remove-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    team_id: this.team_id,
                    student_uid: uid,
                    course: this.course,
                    section: this.section,
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success(data.message);
            } else {
                toast.error(data.message);
                console.log(data.message);
            }

        } catch(e) {
            toast.error('Error. Removing student from team failed.');
            console.log(e);

        }
    }

    async deleteTeam() {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/delete-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    team_id: this.team_id,
                    course: this.course,
                    section: this.section,
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;
            } else {
                toast.error(data.message);
                console.log(data.message);
                return false;
            }
        } catch (e) {
            toast.error('Error. Deleting team failed.');
            console.log(e);
            return false;
        }
    }
}