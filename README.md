# SDLCFlow

This project is split into a React frontend and a Python backend.

- `frontend/` contains the Next.js app.
- `backend/` contains the FastAPI service for Groq and Vercel integration.

## Getting Started

1. Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

2. In another terminal, start the Python backend:

```bash
cd ..
python3 -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

If you prefer, you can also use the root wrapper scripts:

```bash
npm run dev
npm run backend:dev
```

Open [http://localhost:3000](http://localhost:3000) after both services are running.

## Environment

Paste your API values into the root `.env` file. `frontend/.env.local.example`
is kept only as a reference for deployments that prefer frontend-local env
files.

The backend and frontend rewrite layer load:

- `GROQ_API_KEY`
- `VERCEL_TOKEN`
- `BACKEND_URL` for API rewrites
- `GROQ_API_URL` and `VERCEL_DEPLOY_API_URL` for external API endpoints

## Structure

- `frontend/src/app` - frontend pages and layout
- `frontend/src/components` - React UI components
- `frontend/src/lib` - shared frontend helpers
- `backend/app` - FastAPI app, schemas, and SDLC phase definitions
