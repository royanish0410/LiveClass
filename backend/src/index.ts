import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';

import classRoutes from './routes/classRoutes';
import { setupWebSocket } from './websocket';

const app = express();

// The fix: Configure CORS to explicitly allow your Vercel frontend.
const vercelFrontendUrl = 'https://live-class-tan.vercel.app';
const corsOptions = {
    origin: vercelFrontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
  });

// ✅ Routes
app.use('/api', classRoutes);

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.send('LiveClass Backend Running');
});

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup WebSocket server
setupWebSocket(server);

// ✅ Start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});