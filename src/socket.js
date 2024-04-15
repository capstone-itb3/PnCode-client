import { io } from 'socket.io-client';

export const initSocket = async () => {
    const option = {
        'force new connection': true,
        reconnectionAttempts : 'Infinity',
        timeout: 1000,
        transports: ['websocket']
    };
    return io.connect(process.env.REACT_APP_BACKEND_URL, option);
};