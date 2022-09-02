"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const SocketServer = (socket) => {
    socket.on('joinRoom', (id) => {
        socket.join(id);
        // console.log({ joinRoom: (socket as any).adapter.rooms })
    });
    socket.on('outRoom', (id) => {
        socket.leave(id);
        // console.log({ outRoom: (socket as any).adapter.rooms })
    });
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
    });
};
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket.js.map