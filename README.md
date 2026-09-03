# Code Jigsaw — Rebuild. Think. Code.

> **Production-Ready Engineering Day Coding Competition Platform**  
> A high-performance, secure, full-stack web application where developers reconstruct scrambled code snippets against the clock, inspect step-by-step execution simulations, manage competition questions, and compete on a deterministic global leaderboard.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Database Models & MongoDB Collections](#-database-models--mongodb-collections)
- [No-Repeat Question Selection Engine](#-no-repeat-question-selection-engine)
- [Technology Stack](#-technology-stack)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Installation & Setup Guide](#-installation--setup-guide)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [Admin Credentials & Admin Dashboard](#-admin-credentials--admin-dashboard)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Scoring & Leaderboard Algorithms](#-scoring--leaderboard-algorithms)
- [Automated Testing & Verification](#-automated-testing--verification)

---

## 🎯 Overview

**Code Jigsaw** is a gamified coding platform designed for competitions, hackathons, and learning environments. Instead of writing code from scratch, players are presented with scrambled lines of code and must drag or assign line numbers to reconstruct the original program correctly before time runs out.

All problem sets, player accounts, game logs, and leaderboard statistics are securely managed using **MongoDB**. The platform includes a **No-Repeat Question Engine**, an **Offline Code Execution Simulation Panel**, **Admin Management Tools**, and **Role-Based Authentication**.

---

## 🚀 Key Features

- 🧩 **Code Reconstruction Puzzles**: 5-question timed competition matches across **8 supported programming languages** (`C`, `Python`, `C++`, `Java`, `JavaScript`, `C#`, `PHP`, `TypeScript`) and **3 difficulty tiers** (`Easy`, `Moderate`, `Hard`).
- 🔄 **Smart No-Repeat Question Engine**: Tracks seen questions per player in MongoDB. Questions will **never repeat** for a player until all 1,200+ problems in that language and difficulty pool have been completed, after which a fresh cycle begins.
- ⏱️ **Server-Authoritative Match Timer**: Global shared timer across questions with seamless page-refresh state recovery and expired-session protection.
- 🔬 **Interactive Code Simulation Trace Engine**: Step-by-step variable state execution trace for Python, JavaScript, and TypeScript running locally in Node.js without third-party API dependencies.
- 🏆 **Deterministic Global Leaderboard**: Multi-tier tie-breaking algorithm (`Correct Answers` → `Total Score` → `Difficulty Weight` → `Time Used` → `Selected Time` → `Completion Timestamp`).
- 📖 **3D Book-Opening Auth UI**: Realistic 3D perspective page-turn animation (`perspective: 1400px`, `rotateY(180deg)`) for switching between Player Login and Player Registration.
- 👁️ **Show/Hide Password Toggles**: Accessible password visibility toggle buttons across Admin Login, Player Login, and Player Register forms.
- 🛡️ **Admin Dashboard & Question Bank CRUD**: Dedicated Admin suite with single-admin account protection, 4 statistical overview cards, question filtering, search, multiline code parser, active/inactive toggling, and live preview modal.
- 👤 **Player Profile Identity Management**: Player profile modal allowing instant display name updates that synchronize across MongoDB, game UI, result pages, and leaderboards.
- 🧹 **Built-In Production Maintenance Utilities**: Dedicated scripts to safely seed 1,200+ questions (`npm run seed`) and reset game history while preserving problem sets and admin credentials (`npm run cleanup`).

---

## 🏗️ Architecture & Directory Structure

```
CODE JIGSAW/
├── client/                      # React 18 + Vite Frontend
│   ├── public/                  # Static web assets
│   ├── src/
│   │   ├── components/          # UI Components (Navbar, CodeEditor, SimulationPanel, etc.)
│   │   ├── config/              # Frontend configuration (Theme, Language rules)
│   │   ├── context/             # Global GameContext state provider
│   │   ├── pages/               # Page views (Home, GamePage, AuthPage, Leaderboard, AdminDashboard)
│   │   ├── services/            # Axios API layer (gameApi.ts, api.ts)
│   │   ├── types/               # TypeScript interfaces & type declarations
│   │   ├── App.tsx              # Main App router
│   │   ├── index.css            # Custom CSS & Tailwind styles
│   │   └── main.tsx             # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # DB connection & Supported languages config
│   │   ├── controllers/         # Request handlers (auth, game, admin, leaderboard)
│   │   ├── middlewares/         # Middleware (adminAuth, playerAuth, validation, errorHandler)
│   │   ├── models/              # Mongoose DB schemas (Question, Game, Player, Admin, PlayerProgress)
│   │   ├── routes/              # Express API routers
│   │   ├── scripts/             # Maintenance scripts (seed.ts, cleanupDb.ts)
│   │   ├── services/            # Core business logic (gameService, simulationService)
│   │   ├── tests/               # Automated test runner (testRunner.ts)
│   │   ├── utils/               # Auth crypto, scoring formula, question shuffler
│   │   └── server.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md                    # Project Documentation
```

---

## 🗄️ Database Models & MongoDB Collections

All application state is stored in **MongoDB** across 5 primary collections:

| Collection | Model File | Purpose & Stored Data |
|---|---|---|
| `questions` | [Question.ts](file:///c:/Users/suren/Documents/CODE%20JIGSAW/server/src/models/Question.ts) | 1,200+ problem codes containing titles, descriptions, programming language, difficulty, scrambled code lines with canonical position tags, expected outputs, and explanations. |
| `games` | [Game.ts](file:///c:/Users/suren/Documents/CODE%20JIGSAW/server/src/models/Game.ts) | Match session records tracking player names, selected duration, start/expiration timestamps, current question index, total score, correct answers, and line selection history. |
| `players` | [Player.ts](file:///c:/Users/suren/Documents/CODE%20JIGSAW/server/src/models/Player.ts) | Registered player user accounts with email addresses, PBKDF2 hashed passwords, display names, and creation dates. |
| `admins` | [Admin.ts](file:///c:/Users/suren/Documents/CODE%20JIGSAW/server/src/models/Admin.ts) | Admin login account details, email, unique user ID, display name, and hashed credentials. |
| `playerprogresses` | [PlayerProgress.ts](file:///c:/Users/suren/Documents/CODE%20JIGSAW/server/src/models/PlayerProgress.ts) | Tracks seen question IDs per player per `(language, difficulty)` combination for the No-Repeat Question Engine. |

---

## 🔄 No-Repeat Question Selection Engine

To deliver a unique experience every match, Code Jigsaw features a server-side No-Repeat Question Engine in `gameService.ts`:

1. **Player Identification**: Tracks progress using permanent MongoDB player `_id` for authenticated players, or sanitized `guest::<name>` for guest players.
2. **Exclusion Lookup**: Before selecting questions, queries `playerprogresses` for question IDs already seen by the player in the chosen language and difficulty.
3. **Random Offset Sampling**: Applies a random skip offset across unseen candidates to guarantee varied problem ordering across matches.
4. **Full-Cycle Auto-Reset**: When a player has answered all questions in a specific `(language, difficulty)` pool, the system automatically resets their seen list for that pool, logging a cycle completion and restarting fresh.
5. **Persistence**: Newly selected question IDs are automatically added to the player's progress document upon starting a game match.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Custom Dark Palette: Jet Black, Graphite, Dark Slate, Emerald Green, Amber, Coral — **NO BLUE**)
- **Icons**: Lucide React
- **HTTP Client**: Axios with custom request/response interceptors for Bearer token handling
- **Routing**: React Router DOM v6

### Backend
- **Runtime**: Node.js + Express.js + TypeScript (`tsc` & `tsx`)
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: Native Node `crypto` (`pbkdf2Sync` with SHA-512 & HMAC-SHA256 bearer tokens)
- **Security**: Helmet, Express Rate Limit, CORS, Input Sanitization

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the `server/` directory (refer to `server/.env.example`):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/code_jigsaw
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_code_jigsaw_2026

# Admin Credentials (Auto-created on server start if missing in DB)
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_USER_ID=admin123
ADMIN_PASSWORD=change_this_secure_password_123

# Optional: Path to custom 1200+ questions JSON file for seeding
# SEED_FILE_PATH=c:/Users/suren/Downloads/code_jigsaw_questions_1200.json
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/code-jigsaw.git
cd "CODE JIGSAW"

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Seed Question Bank & Start Backend

```bash
cd ../server

# (Optional) Seed 1,200+ questions into MongoDB
npm run seed

# Run Backend Development Server
npm run dev
```
*Backend will run at `http://localhost:5000`*

### 3. Start Frontend Client

```bash
cd ../client
npm run dev
```
*Frontend will run at `http://localhost:5173`*

---

## 📜 NPM Scripts Reference

### Server Commands (`/server`)

| Command | Action |
|---|---|
| `npm run dev` | Starts backend development server with auto-reload (`tsx watch src/server.ts`). |
| `npm run build` | Compiles TypeScript source files into output JavaScript (`dist/`). |
| `npm start` | Launches compiled production server from `dist/server.js`. |
| `npm run seed` | Seeds MongoDB questions collection from JSON dataset. |
| `npm run cleanup` | Safely removes all `games`, `players`, and `playerprogresses` from MongoDB while preserving `questions` (1200+) and `admins`. |
| `npm run test` | Runs the automated test runner validating scoring, auth, and leaderboard logic. |

### Client Commands (`/client`)

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server. |
| `npm run build` | Compiles production bundle with TypeScript check & Vite build. |
| `npm run preview` | Previews production build locally. |

---

## 🔐 Admin Credentials & Admin Dashboard

The backend automatically creates and maintains a single authoritative Admin account upon startup:

- **Admin Login Route**: `/admin/login` (accessible via Navbar Admin portal button)
- **Configured via Environment Variables**: Set `ADMIN_EMAIL`, `ADMIN_USER_ID`, and `ADMIN_PASSWORD` in `server/.env`.
- **Default Fallbacks**: `ADMIN_EMAIL` (`admin@example.com`), `ADMIN_USER_ID` (`admin123`), `ADMIN_PASSWORD` (`AdminPass@123456`).

### Admin Features
1. **Overview Dashboard**: Displays 4 metrics: Total Questions, Supported Languages (8), Registered Players, and Top Rank Player.
2. **Question Management**: Search by title or ID, filter by Language and Difficulty, add new multiline code problems, edit existing problems, toggle active status, or preview problem layouts.
3. **Admin Profile**: Update display identity directly from the profile modal.

---

## 📡 API Endpoints Reference

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register new player account.
- `POST /api/auth/login` — Login player account and receive Bearer token.
- `GET /api/auth/me` — Fetch authenticated player profile.
- `PUT /api/auth/profile` — Update player display name.
- `POST /api/auth/logout` — End player session.

### Game Gameplay Routes (`/api/game`)
- `POST /api/game/start` — Initialize 5-question match with No-Repeat selection logic.
- `GET /api/game/:gameId` — Fetch session state & active question (sanitized without solution positions).
- `POST /api/game/:gameId/answer` — Submit line arrangement for evaluation and scoring.
- `POST /api/game/:gameId/next` — Advance to next question in session.
- `POST /api/game/:gameId/simulation` — Generate step-by-step code execution trace.
- `POST /api/game/:gameId/complete` — Complete game session manually or on time expiry.

### Leaderboard Routes (`/api/leaderboard`)
- `GET /api/leaderboard` — Get global rankings (filterable by language & difficulty).
- `GET /api/leaderboard/rank/:gameId` — Get specific match rank on global leaderboard.

### Admin Routes (`/api/admin`)
- `POST /api/admin/login` — Admin login via Email or User ID.
- `GET /api/admin/me` — Fetch current admin profile.
- `PUT /api/admin/profile` — Update admin display name.
- `GET /api/admin/stats` — Fetch dashboard statistics overview.
- `GET /api/admin/questions` — Paginated list of questions with search & filter.
- `POST /api/admin/questions` — Create new question problem.
- `PUT /api/admin/questions/:id` — Update existing question.
- `PATCH /api/admin/questions/:id/toggle` — Toggle question active/inactive state.
- `DELETE /api/admin/questions/:id` — Soft-delete / deactivate question.

---

## 🏆 Scoring & Leaderboard Algorithms

### Question Scoring Formula (`scoring.ts`)
Points are calculated dynamically per question based on difficulty, accuracy, and speed:

$$\text{Points} = \text{BasePoints} \times \left(0.6 + 0.4 \times \frac{\text{TimeRemaining}}{\text{TotalGameTime}}\right)$$

- **Base Points**:
  - `Easy`: 5 to 8 points per question
  - `Moderate`: 6 to 10 points per question
  - `Hard`: 8 to 10 points per question
- **Incorrect Submission**: Grants `0` points.

### Deterministic Leaderboard Ranking Order (`leaderboardController.ts`)
Leaderboard rankings are resolved strictly using 6 deterministic tie-breaking rules:

1. **`correctAnswers` DESC** (Accuracy takes primary priority)
2. **`totalScore` DESC** (Higher total score breaks ties)
3. **`difficultyWeight` DESC** (Hard = 3 > Moderate = 2 > Easy = 1)
4. **`timeUsed` ASC** (Faster completion time takes precedence)
5. **`selectedTime` ASC** (Shorter timer configuration takes precedence)
6. **`createdAt` ASC** (Earlier match completion timestamp wins final ties)

---

## 🧪 Automated Testing & Verification

Run the built-in automated test suite:

```bash
cd server
npm run test
```

### Verified Test Cases
- ✅ **Suite 1**: Score calculation bounds, time ratio scaling, zero points on wrong answer.
- ✅ **Suite 2**: PBKDF2 password hashing, salt validation, Admin JWT signing and decoding, token rejection on malformed signatures.
- ✅ **Suite 3**: Player account JWT token creation, token role isolation between Player and Admin accounts.
- ✅ **Suite 4**: Multi-factor leaderboard tie-breaking algorithm sorting.

---

## 📄 License

Engineering Day Coding Competition Platform — Built for high-stakes competition gameplay.
