import Admin from '../AdminClass';
import api from '../../api';

export default async function getAdminClass() {
  try {
    const response = await api.post('/api/admin/verify-token');
    const data = response.data;
    return data?.status === 'ok' ? new Admin(data.auth.admin_uid, data.auth.first_name, data.auth.last_name) : false;

  } catch (e) {
    return e?.response && (e.response.status === 401) ? window.location.href = '/error/404' : false;
  }
}