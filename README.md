# CalTrack – Personal Calorie Consistency Tracker

> *"Consistency over perfection."*

**CalTrack** is a modern, responsive full-stack MERN application designed for mindful calorie tracking and daily consistency. Rather than complicating nutrition with tedious micro-management, CalTrack focuses on building sustainable daily habits through estimated minimum and maximum calorie intake ranges, an interactive GitHub-style contribution calendar, streak analytics, and milestone achievements.

---

## 🌟 Key Features

- **Estimated Calorie Range & Automatic Midpoint**:
  - Record daily minimum and maximum estimated calories (kcal).
  - Automatically calculates and displays the midpoint (e.g. `1800 – 2100 kcal`, midpoint: `1950 kcal`).
  - Supports optional personal notes (meal summaries, ChatGPT estimations, workout reflections).

- **GitHub-Style Contribution Calendar**:
  - Interactive year-long contribution heatmap (52 weeks × 7 weekdays).
  - Logged days shine in vibrant emerald green; untracked days in sleek dark charcoal.
  - Hover tooltips reveal detailed daily calorie ranges, midpoints, and notes.
  - Click any calendar square to immediately inspect or log an entry for that specific day.
  - Full year navigation and horizontal scroll on mobile.

- **Intelligent Streak System**:
  - **Consecutive Day Tracking**: Automatically counts consecutive calendar days based on the user's configured timezone.
  - **Grace Window**: If today has not been logged yet but yesterday was logged, the streak remains active until the end of today.
  - **Permanent High-Water Marks**: Longest streak ever reached is preserved and drives milestone awards.
  - Streak calculations are isolated in dedicated backend services and never rely on raw database record counts.

- **Milestone Achievements System**:
  - Automatically unlocks badges when reaching key milestones:
    - 🚶 **First Step** – 1 day
    - 🔥 **Getting Started** – 7 days
    - 🛡️ **Consistency Warrior** – 21 days
    - 📅 **Monthly Master** – 30 days
    - ⚡ **Iron Discipline** – 50 days
    - 🏆 **Century Club** – 100 days
    - 🎖️ **Half Year Hero** – 180 days
    - 👑 **One Year Legend** – 365 days
  - Celebratory pop-up celebration modal upon unlocking a new milestone.
  - Displays progress percentages toward upcoming milestone goals.

- **Analytics & Trend Visualizations (Recharts)**:
  - Daily midpoint trend with min-max range envelope band.
  - 7-day rolling average and 30-day consistency percentage.
  - Consistency by day of the week (frequency and average calories).
  - Monthly average progression charts.
  - Highest and lowest recorded estimates.

- **History & Management**:
  - Chronological history table with pagination.
  - Filter by year, month, or search text across dates, notes, and calories.
  - Safe inline editing and confirmation modals before deletion.

- **Linear-Inspired Dark Dashboard**:
  - Modern dark charcoal aesthetic (`#090d16` background, `#111726` surfaces, `#24304d` subtle borders).
  - Accentuated with emerald green (`#10b981`).
  - Desktop collapsible sidebar and mobile-optimized drawer navigation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing
- **Security**: CORS, express-rate-limit, input validation, centralized error handling
- **Zero-Config Database**: Automatic fallback to embedded MongoDB if no local MongoDB service is running

---

## 📁 Project Architecture

```
caltrack/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── assets/             # Static graphics and icons
│   │   ├── components/
│   │   │   ├── achievements/   # AchievementCard & CelebrationModal
│   │   │   ├── common/         # Toast, LoadingSpinner, EmptyState, Modal
│   │   │   ├── dashboard/      # StatCard, StreakCard, ContributionCalendar
│   │   │   └── entries/        # CalorieEntryModal & Form
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # AppLayout, Sidebar, Header
│   │   ├── pages/              # Dashboard, History, Statistics, Achievements, Settings, Auth
│   │   ├── services/           # Axios API service
│   │   ├── utils/              # Date manipulation & Calendar grid algorithms
│   │   ├── App.jsx             # Route definitions & protected routes
│   │   ├── index.css           # Tailwind base styles & theme utilities
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML shell
│   ├── tailwind.config.js      # Tailwind dark theme configuration
│   └── vite.config.js          # Vite config & API proxying
│
├── server/                     # Backend Express.js API
│   ├── config/                 # Database connection (MongoDB + zero-config fallback)
│   ├── controllers/            # Route handler logic
│   ├── middleware/             # JWT auth protection & centralized error handling
│   ├── models/                 # User, DailyEntry, Achievement Mongoose schemas
│   ├── routes/                 # Express API routes
│   ├── services/               # Streak calculation & Achievement evaluation services
│   ├── utils/                  # Achievement definitions & date shift algorithms
│   ├── .env.example            # Environment template
│   └── server.js               # Express application entrypoint
│
├── package.json                # Root package scripts
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(optional)*: MongoDB 6+ running locally on port 27017, or a MongoDB Atlas URI. *(If not running, CalTrack automatically initializes an embedded MongoDB instance for seamless operation!)*

### 2. Environment Configuration
Copy the sample environment file in `server/`:

```bash
cd server
cp .env.example .env
```

Configuration variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/caltrack
JWT_SECRET=caltrack_super_secure_jwt_secret_key_2026_consistency_tracker
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Installation
Install dependencies for both the backend and frontend:

```bash
# In the root project folder
npm run install:server
npm run install:client
```

### 4. Running the Application

#### Option A: Run Full Production App
```bash
# Build frontend assets
npm run build

# Start the unified server (serves API and client on port 5000)
npm run start
```
Open **`http://localhost:5000`** in your browser.

#### Option B: Run in Development Mode
In two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run server
# Runs Express on http://localhost:5000
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
npm run client
# Runs Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Account

For quick exploration, CalTrack includes a one-click demo login on the sign-in screen:

- **Email**: `alex@caltrack.io`
- **Password**: `caltrack123`

Or register any new custom account via the **Create Account** page.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `confirmPassword`, `timezone`)
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Validate current session and retrieve profile

### Dashboard
- `GET /api/dashboard?year=YYYY` — Retrieve complete dashboard dataset (streaks, today's entry, milestone progress, calendar days map, recent logs)

### Daily Entries
- `GET /api/entries` — List entries with pagination & filters (`startDate`, `endDate`, `month`, `year`, `page`, `limit`)
- `POST /api/entries` — Log a daily calorie estimate (`date`, `minCalories`, `maxCalories`, `notes`)
- `GET /api/entries/:date` — Retrieve entry for specific calendar day
- `PUT /api/entries/:date` — Update calorie entry for day
- `DELETE /api/entries/:date` — Delete entry for day

### Achievements & Milestones
- `GET /api/achievements` — Get all 8 milestone definitions with unlock status, timestamps, and progress

### Statistics
- `GET /api/statistics` — Get aggregate calorie averages, Recharts trend data, and day-of-week distributions

### Profile & Settings
- `GET /api/users/profile` — Get user profile details
- `PUT /api/users/profile` — Update display name and timezone preference
- `PUT /api/users/change-password` — Change password with current password verification

---

## 🛡️ Security Best Practices

- Passwords hashed using `bcryptjs` with salt rounds = 10. Plaintext passwords are never saved.
- Secure JWT bearer authentication on all private routes.
- Strict per-user isolation: users can only view, edit, or delete their own data.
- Rate limiting on authentication routes prevents brute-force attempts.
- Centralized validation rejects negative values and enforces `minCalories <= maxCalories`.
- Canonical `YYYY-MM-DD` date indexing prevents timezone shift bugs.

---

## 📜 License

MIT License. Built for consistency and fitness mindfulness.
