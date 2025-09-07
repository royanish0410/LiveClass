import { Server } from 'socket.io';
import http from 'http';

export function setupWebSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Additional events go here
  });
}
