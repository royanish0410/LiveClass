import { WebSocket, WebSocketServer } from 'ws';
import ClassModel from '../models/Class';

interface WebSocketMessage {
  type: string;
  payload?: any;
  classId: string;
  message?: string;
  isTyping?: boolean;
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
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
      if (!parsedMessage.classId) {
          console.error('WebSocket message missing classId');
          return;
      }
      
      // Persist the message to the database
      if (parsedMessage.type === 'chat') {
          await ClassModel.findByIdAndUpdate(parsedMessage.classId, { $push: { chatEvents: parsedMessage } });
      }

      // Broadcast the message to all clients.
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