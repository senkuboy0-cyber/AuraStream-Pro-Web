# AuraStream Pro Web

## Development Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/senkuboy0-cyber/AuraStream-Pro-Web.git
cd AuraStream-Pro-Web

# Install root dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and other settings

# Start development servers
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aurastream
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## Project Structure

```
AuraStream-Pro-Web/
├── client/                 # Next.js 14 frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   └── store/             # Zustand state management
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── plugins/       # Plugin engine
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── services/      # Services
│   └── index.js           # Entry point
├── render.yaml            # Render deployment
└── package.json           # Workspace config
```

## Scripts

```bash
npm run dev        # Start both client and server
npm run dev:client # Start only client
npm run dev:server # Start only server
npm run build      # Build for production
npm start          # Start production server
```

## Features

### Backend
- Dynamic Plugin Engine with secure sandboxing (vm2)
- Stream Resolver with CORS proxy
- MongoDB integration
- RESTful API

### Frontend
- Next.js 14 App Router
- Tailwind CSS with glassmorphic design
- Framer Motion animations
- HLS.js video player
- Zustand state management

## License

MIT
