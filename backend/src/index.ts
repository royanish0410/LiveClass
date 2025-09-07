import dotenv from 'dotenv';
dotenv.config(); // <-- This should be the first thing you do

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import classRoutes from './routes/classRoutes';
import { setupWebSocket } from './websocket';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || '').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Mongo connection error:', err);
});

app.use('/api', classRoutes);

app.get('/', (req, res) => {
  res.send('LiveClass Backend Running');
});

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});