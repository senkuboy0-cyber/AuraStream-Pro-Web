# AuraStream-Pro-Web

> **Next-Generation Streaming Platform with Plugin-Based Architecture**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-20%2B-brightgreen.svg)

## 🎯 Overview

AuraStream-Pro-Web is a high-end, plugin-based streaming web application inspired by the Cloudstream ecosystem. It features a dynamic Provider Engine, secure plugin sandboxing, and an ultra-premium glassmorphic UI.

## ✨ Features

### Core Features
- **Dynamic Extension Manager** - Add/remove streaming provider repositories
- **Secure Plugin Sandbox** - Isolated JavaScript execution using vm2
- **Global Search** - Real-time search across all installed providers
- **HLS Video Player** - Custom player with quality selector and subtitles
- **Watch History** - Continue watching with progress sync
- **Bookmarks** - Save favorite content

### Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **Security**: vm2 for plugin isolation
- **Streaming**: HLS.js for adaptive streaming

## 📁 Project Structure

```
AuraStream-Pro-Web/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   └── styles/            # Global styles
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── plugins/       # Plugin engine
│   │   ├── providers/     # Provider implementations
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── index.js           # Server entry point
├── render.yaml            # Render deployment config
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/senkuboy0-cyber/AuraStream-Pro-Web.git
cd AuraStream-Pro-Web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/aurastream
GITHUB_TOKEN=your_github_token_here
```

## 🔌 Plugin System

### Repository Format
Providers are distributed via GitHub repositories with a `repo.json` file:

```json
{
  "name": "My Providers",
  "version": "1.0.0",
  "providers": [
    {
      "name": "ProviderName",
      "file": "providers/provider.js",
      "version": "1.0.0"
    }
  ]
}
```

### Available Repositories
- Add repositories via the Extension Manager in-app

## 🎨 Design System

### Theme
- **Primary Background**: Deep Midnight Black (#050505)
- **Glassmorphic Overlays**: `backdrop-blur-xl` with subtle borders
- **Typography**: Geist/Inter font family
- **Icons**: Lucide-React SVG icons (no emojis)

### Animation Guidelines
- Staggered grid animations for cards
- Spring physics for modal transitions
- Skeleton loaders during data fetching

## 📦 Deployment

### Render Deployment

1. Connect GitHub repository to Render
2. Configure environment variables
3. Deploy automatically via `render.yaml`

```bash
# Manual deploy
npm run build
npm start
```

## 🔒 Security

- All third-party plugins run in isolated VM contexts
- No access to main server process from plugins
- CORS and User-Agent headers handled server-side
- Rate limiting on API endpoints

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ by the AuraStream Team**
