# Tag Me - Cute Pink Girly Tag Game

A fun and adorable tag game built with the MERN stack featuring a cute pink girly theme!

## Project Structure

\`\`\`
tag-me-game/
├── db/                 # Database models and connection
├── backend/           # Express.js server and API routes
├── frontend/          # React.js application
└── README.md
\`\`\`

## Features

- 🌸 Cute pink girly theme with beautiful UI
- 👥 User authentication (register/login)
- 🎮 Real-time tag game mechanics
- 🏆 Leaderboard with time-based filtering
- 📊 Player statistics and game history
- 💕 Responsive design with smooth animations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Database Setup
1. Navigate to the db folder:
   \`\`\`bash
   cd db
   npm install
   \`\`\`

### Backend Setup
1. Navigate to the backend folder:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. Create a `.env` file with:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tag_game
   JWT_SECRET=your_super_secret_jwt_key_here
   \`\`\`

3. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the frontend folder:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. Start the React development server:
   \`\`\`bash
   npm start
   \`\`\`

## How to Play

1. **Register/Login**: Create an account or sign in
2. **Start Game**: Click "Start New Game" to begin
3. **Tag Players**: If you're "IT", click on other players to tag them
4. **Earn Points**: Get 10 points for each successful tag
5. **Check Leaderboard**: See who's the top player!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Game
- `POST /api/game/start` - Start new game
- `GET /api/game/status` - Get current game status
- `POST /api/game/tag` - Tag another player

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard with optional time filter

## Technologies Used

- **Frontend**: React.js, Axios, CSS3
- **Backend**: Node.js, Express.js, JWT
- **Database**: MongoDB
- **Styling**: Custom CSS with pink girly theme

Enjoy playing Tag Me! 💖🎮
