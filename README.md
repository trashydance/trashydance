# trashydance

> A real-time 1-to-1 chat web application built as the final project of the 42 Common Core (`ft_transcendence`).

## Overview

trashydance is a minimalist chat platform where registered users can exchange text messages in real-time, build a social network through a unidirectional follow system, and quickly find past conversations through full-text search.

## Features

- **Real-time messaging** — 1-to-1 text chat powered by WebSocket (socket.io)
- **User authentication** — Email/password registration + OAuth 2.0 with 42 Intra
- **Social layer** — Follow/unfollow system with friends prioritization
- **Online presence** — Real-time online/offline status for followed users
- **Smart home** — Chat list ordered by recent activity, friends first
- **Search** — Global search across users and message history
- **User profiles** — Public profiles with avatar, follower/following counts
- **Responsive design** — Mobile-first neobrutalist UI built with Tailwind CSS 4 + shadcn/ui
- **Privacy & Terms** — Complete legal pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui (neobrutalism) |
| Backend | Next.js custom server, socket.io 4 |
| Auth | better-auth 1.6 (credentials + OAuth 2.0 via 42) |
| Database | SQLite + Drizzle ORM 0.45 |
| Validation | Zod 4 + react-hook-form |
| Tooling | TypeScript 5 (strict), Biome 2.4, pnpm |
| Deploy | Docker + Docker Compose |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Next.js App (React 19)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │  │
│  │  │  Pages   │  │  Comps   │  │ socket.io-client│  │  │
│  │  └────┬─────┘  └────┬─────┘  └───────┬────────┘   │  │
│  └───────┼──────────────┼───────────────┼────────────┘  │
└──────────┼──────────────┼───────────────┼────────────────┘
           │ HTTP         │ HTTP          │ WebSocket
           ▼              ▼               ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js Custom Server                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  App Router      │  │  better-auth │  │ socket.io  │  │
│  │  (API Routes +   │  │  (sessions,  │  │ (real-time │  │
│  │   Server Comps)  │  │   OAuth)     │  │  messages) │  │
│  └────────┬─────────┘  └──────┬───────┘  └─────┬──────┘  │
│           │                   │                 │         │
│           ▼                   ▼                 ▼         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Drizzle ORM                           │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    SQLite    │
                    └──────────────┘
```

### Database Schema

| Table | Description |
|-------|-------------|
| `user` | User accounts (id, name, email, password hash, image, timestamps) |
| `follow` | Unidirectional follow relationships between users |
| `conversation` | 1-to-1 conversation containers linking two participants |
| `message` | Individual messages with sender, conversation reference, content, and timestamp |
| `session` | Active user sessions with token, IP address, user agent, and expiry |
| `account` | OAuth provider accounts linked to users (42 Intra) |

## Modules (ft_transcendence)

| Status | Section | Module | Type | Points |
|:------:|---------|--------|------|-------:|
| OK | Web | Full-Stack framework (Next.js) | Major | 2 |
| OK | Web | Real-time features using WebSockets (socket.io) | Major | 2 |
| OK | Web | User interactions (chat + profile + friends) | Major | 2 |
| OK | Web | ORM (Drizzle) | _Minor_ | 1 |
| OK | Web | Custom design system (13+ components) | _Minor_ | 1 |
| OK | User Mgmt | Standard user management | Major | 2 |
| OK | User Mgmt | OAuth 2.0 (42 Intra) | _Minor_ | 1 |
| | **Total** | | | **11** |

*Additional modules TBD to reach the required 14 points.*

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 22+, pnpm 9+ for local development

### Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd trashydance

# Copy environment variables
cp .env.example .env
# Edit .env with your secrets

# Start the application
docker compose up
```

The app will be available at `http://localhost:3000`.

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### 42 OAuth Setup

1. Create an OAuth application in the 42 Intra admin panel.
2. Add this callback URL in your 42 app settings:
   - `http://localhost:3000/api/auth/oauth2/callback/42`
3. Set the `FORTYTWO_CLIENT_ID` and `FORTYTWO_CLIENT_SECRET` variables in your `.env` file.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Path to SQLite database file | Yes |
| `BETTER_AUTH_SECRET` | Secret key for session encryption | Yes |
| `BETTER_AUTH_URL` | Base URL of the application | Yes |
| `FORTYTWO_CLIENT_ID` | 42 OAuth client ID | For OAuth |
| `FORTYTWO_CLIENT_SECRET` | 42 OAuth client secret | For OAuth |
| `PORT` | Server port (default: 3000) | No |

## Team

| Role | Member |
|------|--------|
| Product Owner + Developer + Designer | fmartusc |
| Technical Lead + Developer | edforte |
| Technical Lead + Developer | vzashev |
| Project Manager + Developer | lrocca |

## License

This project is developed as part of the 42 school curriculum.
