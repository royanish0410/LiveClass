# LiveClass - Interactive Virtual Classroom Platform

LiveClass is a real-time interactive classroom platform that enables seamless collaboration between teachers and students through video, chat, and a shared whiteboard.

## 🚀 Key Features

### Teacher Dashboard
- **Class Creation**: Create virtual classrooms with customizable participant limits
- **Session Control**: Start/stop class sessions on demand
- **Real-time Monitoring**: View active participants and manage waitlists
- **Easy Sharing**: Generate unique class IDs to share with students

### Student Experience 
- **Simple Join Process**: Enter name and class ID to participate
- **Waitlist System**: Automatic waitlist placement when class is full
- **Interactive Tools**: Access to video, chat, and whiteboard features

### Real-time Collaboration
- **Video Conferencing**: High-quality video/audio streaming via LiveKit
- **Interactive Whiteboard**:
  - Drawing and erasing tools
  - Real-time synchronization across participants
  - Session replay functionality
- **Live Chat**: Instant messaging between participants
- **Session Recording**: Store and replay whiteboard and chat events

## 🛠 Technology Stack

### Frontend (

frontend

)
- **Framework**: Next.js with TypeScript
- **UI**: Tailwind CSS
- **Real-time**: LiveKit Client, WebSocket
- **State Management**: React Hooks

### Backend (

backend

)
- **Runtime**: Node.js with Express
- **Database**: MongoDB
- **Real-time**: WebSocket Server
- **Video Streaming**: LiveKit Server SDK

## 🔧 Setup & Installation

1. Clone the repository
2. Configure environment variables:

```bash
# backend/.env
MONGO_URI=your_mongodb_uri
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
PORT=5000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start with Docker:

```bash
docker-compose up
```

Or run locally:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

### Class Management
```
POST /api/classes           # Create class
POST /api/classes/:id/start # Start session
POST /api/classes/:id/stop  # End session
POST /api/classes/:id/join  # Join class
GET  /api/classes/:id/events # Get session events
```

## 🔄 Concurrency Handling
- Atomic operations for class joining
- Race condition prevention
- Scalable waitlist system

## 🧪 Testing

Run concurrency tests:
```bash
cd backend
npm run test:concurrency
```

## 🐳 Docker Support

Services defined in 

docker-compose.yml

:
- MongoDB database
- Backend API server
- Frontend Next.js server
- LiveKit media server

## 🚀 Future Enhancements

- [ ] User authentication system
- [ ] Video session recording
- [ ] Enhanced whiteboard tools
- [ ] Analytics dashboard
- [ ] Breakout rooms

## 🔐 Security Features

- Secure WebSocket connections
- LiveKit token-based authentication
- Rate limiting on API endpoints
- Participant validation

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

royanish0410: write how to fork this repository

GitHub Copilot: Here's a guide on how to fork this repository:

# How to Fork the LiveClass Repository

## Steps:

1. **Fork the Repository**
   ```bash
   # Visit the repository URL in your browser
   # Click the "Fork" button in the top-right corner of the page
   # Select your GitHub account as the destination
   ```

2. **Clone Your Fork**
   ```bash
   # Replace YOUR-USERNAME with your GitHub username
   git clone https://github.com/YOUR-USERNAME/LiveClass.git
   cd LiveClass
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/LiveClass.git
   git remote -v
   ```

4. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

5. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Push Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "Pull Request"
   - Select your feature branch
   - Click "Create Pull Request"

## 📄 License

This project is licensed under the MIT License.