# Mekla 🍽️

**Mekla** is a real-time web application that helps groups decide where to eat — together.

Users create a shared session, join via a code, set a location, submit food preferences, and receive a single group-approved restaurant recommendation in real time.

---

## ✨ Features

- Real-time group sessions (Socket.IO)
- Host / participant roles
- Location-based restaurant discovery
- Group preference aggregation
- Deterministic shared results
- Clean, mobile-first UI

---

## 🧠 How It Works

1. A host creates a session and shares a room code
2. Participants join using the code
3. The host sets a location
4. Everyone submits food preferences
5. The system calculates and broadcasts a single group result

All users stay synchronized in real time.

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Socket.IO

---

## 🚀 Running Locally

### 1. Start the backend
```bash
cd server
npm install
npm run dev
