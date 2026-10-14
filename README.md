# RSS Feed Application

A full-stack RSS reader where users can subscribe to feeds, browse articles, and discover what others are reading.

## Prerequisites

- Node.js
- A running PostgreSQL instance with a database named `rss_feed`

## Setup

Both the `backend/` and `web/` directories require a `.env` file. Copy `.env.example` in each directory and fill in the values before running.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd web
npm install
npm run dev
```

The app is available at `http://localhost:5173`.
