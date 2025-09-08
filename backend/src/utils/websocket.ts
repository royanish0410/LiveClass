import { WebSocket, WebSocketServer } from 'ws';
import ClassModel from '../models/Class';

interface WebSocketMessage {
  type: string;
  payload: any;
  classId: string;
}

const wss = new WebSocketServer({ noServer: true });
const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, request: any, classId: string) => {
  if (!clients.has(classId)) {
    clients.set(classId, new Set());
  }
  clients.get(classId)?.add(ws);

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (!parsedMessage.classId) {
          console.error('WebSocket message missing classId');
          return;
      }
      
      // Persist the event to the database
      const updateObject = parsedMessage.type === 'chat'
          ? { $push: { chatEvents: parsedMessage } }
          : { $push: { whiteboardEvents: parsedMessage } };
      
      await ClassModel.findByIdAndUpdate(parsedMessage.classId, updateObject);

      // Broadcast the message to all clients in the same class
      const classClients = clients.get(parsedMessage.classId);
      if (classClients) {
        classClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        });
      }
    } catch (e) {
      console.error('Invalid WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    clients.get(classId)?.delete(ws);
    if (clients.get(classId)?.size === 0) {
      clients.delete(classId);
    }
  });
});

export default wss;