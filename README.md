# NextStepDoctor

AI-powered medical research assistant that aggregates evidence from PubMed, OpenAlex, and ClinicalTrials.gov, then delivers structured, personalized, and transparent responses with confidence scoring, analytics, and follow-up suggestions.

> ⚠️ This project provides research insights, not medical advice. Always consult a qualified healthcare professional.

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Security & Privacy](#security--privacy)
- [Roadmap](#roadmap)

## Overview
NextStepDoctor helps users explore medical research by combining multi-source retrieval, ranking, and LLM-based summarization. It supports structured patient context, intent-aware query expansion, research transparency, and accessibility features including voice input/output and distress-sensitive responses.

## Key Features
- **Multi-source retrieval** from PubMed, OpenAlex, and ClinicalTrials.gov.
- **Intent-aware query expansion** for broader and more relevant coverage.
- **Ranking and confidence scoring** to prioritize strong evidence.
- **Structured responses** with condition overview, key insights, trials, and recommendations.
- **Transparency panel** with retrieval stats, query expansion, and model metadata.
- **Follow-up suggestions** tailored to the current query.
- **User accounts & profiles** with persistent patient context.
- **Distress-aware support** with empathetic messaging and crisis resources.
- **Voice input/output** for accessibility.
- **Modern UI** with dark/light themes and mobile-optimized layouts.

## Architecture
```
User (Web UI)
   │
   │ 1) Submit question + optional patient context
   ▼
Next.js Frontend (App Router)
   │
   │ 2) SSE stream to backend
   ▼
Node/Express API
   │
   │ 3) Intent detection + query expansion
   │ 4) Retrieval (PubMed / OpenAlex / ClinicalTrials)
   │ 5) Ranking + confidence scoring
   │ 6) LLM summarization + structured formatting
   │ 7) Analytics + transparency + follow-up generation
   ▼
MongoDB (conversations, user profiles, caching)
```

### Processing Pipeline
1. **Context resolution**: infer disease if not explicitly provided.
2. **Intent detection**: classify query (treatment, diagnosis, trials, etc.).
3. **Query expansion**: generate multiple variations for retrieval.
4. **Retrieval**: fetch results from external sources.
5. **Ranking**: score and sort publications/trials.
6. **LLM response**: produce structured response using only retrieved evidence.
7. **Analytics & confidence**: compute quality and surface transparency.
8. **Follow-up suggestions**: generate next-step questions.

## Tech Stack
**Frontend**
- Next.js (App Router)
- React
- Zustand for state management
- Framer Motion for animations

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Groq LLM (primary) with optional HuggingFace fallback

## Project Structure
```
NextStepDoctor/
├─ backend/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ server.js
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  │  ├─ llm/
│  │  │  ├─ processing/
│  │  │  └─ retrieval/
│  │  └─ utils/
│  └─ package.json
├─ frontend/
│  ├─ app/
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  ├─ store/
│  └─ package.json
└─ README.md
```

## API Overview
Base URL: `/api`

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Fetch profile
- `PUT /api/auth/profile` — Update profile
- `POST /api/chat/stream` — SSE chat pipeline
- `GET /api/conversations` — List conversations
- `GET /api/conversations/:id` — Get conversation
- `POST /api/compare` — Treatment comparison

## Environment Variables
### Backend (Railway / production)
Required:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `FRONTEND_URL`

Recommended:
- `NODE_ENV=production`
- `LLM_PROVIDER=groq`
- `LLM_MODEL=llama-3.1-8b-instant`
- `CACHE_TTL_SECONDS=86400`

Optional:
- `HUGGINGFACE_API_KEY`
- `PUBMED_API_KEY`

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` (Railway backend URL)
- `NEXT_PUBLIC_APP_NAME=NextStepDoctor`

## Local Development
1) Backend
```
cd backend
npm install
npm run dev
```

2) Frontend
```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Deployment
### Backend (Railway)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node src/server.js`
- Healthcheck Path: `/`
- Set env vars listed above

### Frontend (Vercel)
- Root Directory: `frontend`
- Framework: Next.js
- Env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_NAME`
- Update backend `FRONTEND_URL` to the Vercel domain

## Security & Privacy
- Do not store secrets in the repo.
- Rotate API keys if exposed.
- Use HTTPS in production.
- Responses are research summaries, not medical advice.

## Roadmap
- Add configurable crisis resources by country
- Expand evidence weighting and study quality scoring
- Add exports (PDF/CSV) and citations
- Add multilingual support
