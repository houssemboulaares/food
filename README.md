# Mekla — Real‑Time Group Food Decision (MVP)

Mekla is a real-time web application that helps groups decide where to eat — together. A host creates a session, participants join with a code, everyone sets a location and submits preferences, and the system produces a single group recommendation in real time.

## What’s In This Branch
- Client (React + Vite, TypeScript, Tailwind)
  - Pages: Landing, WaitingRoom, Preferences, Results
  - Real-time session sync via Socket.IO client
  - Simple, mobile‑first UI with Leaflet map for location
- Server (Node.js + Express + Socket.IO)
  - In‑memory session management (create/join/leave, readiness, host handling)
  - Overpass/OSM restaurant lookup utility
  - Deterministic result pipeline with basic scoring
- Tooling
  - Pre‑commit hooks (formatting, YAML checks, secret scanning via gitleaks)
  - ESLint for client code

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, Leaflet
- Backend: Node.js, Express, Socket.IO

## Project Structure
```
Mekla/
  client/
    public/            # static assets (vite.svg favicon)
    src/
      context/         # SocketContext for realtime sync
      pages/           # UI pages (Landing, WaitingRoom, Preferences, Results)
      App.tsx          # routes and provider wiring
      main.tsx         # app bootstrap
    package.json
    vite.config.ts
    tailwind.config.js
    eslint.config.js
  server/
    utils/
      sessionManager.js  # in‑memory sessions, participant/host state
      overpass.js        # Overpass API helper for restaurants
    index.js             # socket handlers, recommendation pipeline
    package.json
  .pre-commit-config.yaml
  README.md
```

## Run Locally
1) Server
```
cd server
npm install
npx nodemon index.js
```

2) Client
```
cd client
npm install
npm run dev
```

By default, the client expects the server on http://localhost:3000.

## Current Scope and Limitations
- In‑memory sessions only; no database or persistence
- No authentication or authorization
- Basic scoring logic for recommendations (cuisine and budget signals)
- Default location fallback if host doesn’t set one
- Real‑time state driven solely by server broadcasts

## Status
MVP focused on stability:
- Clean join/leave handling and room updates
- Deterministic host behavior and result flow
- Clear waiting and location‑selection UI
