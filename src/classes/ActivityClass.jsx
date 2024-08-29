import toast from 'react-hot-toast';

export default class Activity {
    constructor (activity_id, activity_name, course_code, section, instructions, open_time, close_time, deadline) {
        this.activity_id = activity_id;
        this.activity_name = activity_name;
        this.course_code = course_code;
        this.section = section;
        this.instructions = instructions;
        this.open_time = open_time;
        this.close_time = close_time;
        this.deadline = deadline;
    }

    async updateDates(new_open_time, new_close_time, new_deadline) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/update-dates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activity_id: this.activity_id,
                    open_time: new_open_time,
                    close_time: new_close_time,
                    deadline: new Date(new_deadline)
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;

            } else {
                toast.error(data.message);
                console.error(data.message);
                return false;
            }
        } catch(e) {
            console.error(e);
            toast.error('Error. Updating activity dates failed.');
        }
    }

    async deleteActivity() {
        try {

            console.log(this.activity_id)
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/delete-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activity_id: this.activity_id
                })
            });

            const data = await response.json();

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (e) {
            toast.error('Error. Deleting activity failed.');
            console.error(e);
        }
    }
}