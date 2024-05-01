"use strict";
const socketServer = require('socket.io');

let socketIO = null;

exports.configure = (server) => {
    try {
        // @ts-ignore
        socketIO = socketServer(server, {
            cors: {
                origin: '*',
            },
        });

        const newSocket = socketIO.of('api/socket');
        register(newSocket);
    } catch (error) {
        throw error;
    }
};

const register = (socketRef) => {
    socketRef.on('connection', (socket) => {
        console.log('user connected ', socket.id);


        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
            chatRef.onDisconnect();
        });
    });
};
