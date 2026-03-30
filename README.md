# ⚔ Stickman Fight Bets — Devvit App

A stickman fighting game for Reddit where you bet on the winner. Each stickman has a unique personality, and wins are tracked on a global leaderboard.

## Setup

You need **Node.js 22+** and the Devvit CLI.

```bash
# Install Devvit CLI globally
npm install -g devvit

# Log in to your Reddit account
devvit login

# Install dependencies
cd stickman-fight
npm install

# Open devvit.json and change "name" to your desired app name
# (must be 0-16 characters, lowercase, no spaces)
Develop
bash
# Start live development on your test subreddit
npm run dev
This runs devvit playtest — it installs the app on your test subreddit and hot-reloads when you change code.

To create a game post: go to your subreddit, click the three dots menu, and tap "Create Stickman Fight Post".

Deploy
bash
# Build and upload a new version
npm run build
devvit upload

# Publish for review (when ready)
npm run launch
Project Structure
text
stickman-fight/
├── devvit.json          # Devvit app config
├── package.json         # Dependencies
├── vite.config.ts       # Vite build config
├── tsconfig.json        # TypeScript config
├── src/
│   ├── client/          # The web app (runs in iframe)
│   │   ├── splash.html  # Loading screen entry point
│   │   ├── splash.tsx   # "Tap to Play" screen
│   │   ├── game.html    # Game entry point
│   │   └── game.tsx     # Full stickman fighting game
│   ├── server/          # Devvit server (runs on Reddit)
│   │   ├── index.ts     # Server entry point
│   │   ├── routes/
│   │   │   ├── api.ts   # Game API (coins, claims, saves, leaderboard)
│   │   │   ├── menu.ts  # Subreddit menu actions
│   │   │   └── triggers.ts  # Auto-create post on install
│   │   └── core/
│   │       └── post.ts  # Post creation helper
│   └── shared/
│       └── api.ts       # Shared TypeScript types
└── tools/               # Build config files
How It Works
Splash screen appears when users see the post in their feed.

Tapping FIGHT expands the post into the full game.

Two random stickmen fight for 10–15 seconds with random attack animations.

Players bet on the winner (outcome is random – the weapon is just for show).

A global leaderboard tracks each stickman's total wins across all players.

Game state (coins, win/loss stats, daily claim) is saved to Redis via the server.

Each user has their own coin balance and daily limit.

text

---

## 🚀 Now Run Build and Launch Again

After applying these fixes, run:

```bash
npm run build
devvit upload
npm run launch
```

To upload to reddit subreddit

```bash
npx devvit upload
npx devvit install r/SmartPeopleGames
```