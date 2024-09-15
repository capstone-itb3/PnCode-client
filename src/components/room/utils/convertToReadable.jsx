export default function convertToReadable(date, length) {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = () => {
        if (length === 'long') {
            return date.toLocaleString('default', { month: 'long' })
        } else {
            return date.toLocaleString('default', { month:'short' })
        }
    };
    const year = date.getFullYear();
    const hours = ((date.getHours() % 12) || 12) < 10 ? '0' + ((date.getHours() % 12) || 12) : ((date.getHours() % 12) || 12);
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = date.getHours() < 12 ? 'AM' : 'PM';

    if (length === 'long') {
        return `${day}, ${month()} ${year} ${hours}:${minutes} ${ampm}`;
    } else {
        return `${day}/${month()}/${year} ${hours}:${minutes} ${ampm}`;
    }
}