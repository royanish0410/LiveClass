import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import ClassModel from './models/Class';

interface ExtendedWebSocket extends WebSocket {
  classId?: string;
  identity?: string;
}

const setupWebSocket = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          const { classId, identity } = message;
          ws.classId = classId;
          ws.identity = identity;
          ws.send(JSON.stringify({ type: 'joined', identity }));

          // Broadcast to other clients in the same class
          broadcast(classId, {
            type: 'new-participant',
            identity
          }, ws);

        } else if (message.type === 'whiteboard') {
          // Broadcast whiteboard event to other clients
          const { classId, event } = message;
          broadcast(classId, { type: 'whiteboard', event }, ws);

          // Optionally, persist to database
          await ClassModel.findByIdAndUpdate(classId, {
            $push: { whiteboardEvents: event }
          });
        } else if (message.type === 'chat') {
          const { classId, chat } = message;
          broadcast(classId, { type: 'chat', chat }, ws);

          // Optionally, persist to database
          await ClassModel.findByIdAndUpdate(classId, {
            $push: { chatEvents: chat }
          });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket disconnected');
    });
  });

  const broadcast = (classId: string, message: any, sender?: ExtendedWebSocket) => {
    wss.clients.forEach(client => {
      const extClient = client as ExtendedWebSocket;
      if (client.readyState === WebSocket.OPEN && extClient.classId === classId && client !== sender) {
        client.send(JSON.stringify(message));
      }
    });
  };

  console.log('WebSocket server running');
};

export { setupWebSocket };
