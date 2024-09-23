import toast from 'react-hot-toast';
import api from '../api';
import errorHandler from '../error';

export default class Activity {
    constructor (activity_id, activity_name, course_code, section, instructions, open_time, close_time) {
        this.activity_id = activity_id;
        this.activity_name = activity_name;
        this.course_code = course_code;
        this.section = section;
        this.instructions = instructions;
        this.open_time = open_time;
        this.close_time = close_time;
    }

    async updateDates(new_open_time, new_close_time) {
        try {
            const response = await api.post('/api/update-dates', {
                    activity_id: this.activity_id,
                    open_time: new_open_time,
                    close_time: new_close_time,
                    // deadline: new Date(new_deadline)
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;

            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async deleteActivity() {
        try {
            const response = await api.post('/api/delete-activity', {
                activity_id: this.activity_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
}