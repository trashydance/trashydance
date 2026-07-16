*This project has been created as part of the 42 curriculum by fmartusc, edforte, vzashev, lrocca.*

# trashydance

> A real-time 1-to-1 chat web application built as the final project of the 42 Common Core (`ft_transcendence`).

## Description

**trashydance** is a minimalist chat platform where registered users can exchange text messages and files in real-time, build a social network through a mutual friend request system, and quickly find past conversations through search. The application features a neobrutalist design aesthetic, two-factor authentication, and full real-time presence tracking.

### Key Features

- **Real-time messaging** — 1-to-1 text and file chat powered by WebSocket (Socket.IO)
- **User authentication** — Email/password registration + OAuth 2.0 with 42 Intra
- **Two-Factor Authentication** — TOTP-based 2FA with backup codes
- **Friend system** — Mutual friend requests with accept/reject flow
- **Online presence** — Real-time online/offline status for friends
- **File sharing** — Upload and share images, documents, and videos in chat
- **User profiles** — Public profiles with avatar, friend count, and status
- **Search** — Global search across users and message history
- **Privacy & Terms** — Complete legal pages with real content
- **Responsive design** — Mobile-first responsive neobrutalist UI

---

## Team Information

| Member | Role(s) | Responsibilities |
|--------|---------|-----------------|
| **fmartusc** | Product Owner + Designer + Fullstack Developer | Defines product vision, prioritizes features. Designed and built the custom neobrutalist component library from scratch using Tailwind CSS. Collaborated on frontend integration, landing page, and legal pages. |
| **edforte** | Technical Lead + Fullstack Developer | Defines technical architecture, ensures code quality. Led authentication system (better-auth + OAuth + 2FA), database schema, and DevOps, collaborating heavily on fullstack API routes. |
| **vzashev** | Technical Lead + Fullstack Developer | Ensures system best practices. Led Socket.IO real-time infrastructure, presence system, and file upload system, collaborating on frontend chat and database operations. |
| **lrocca** | Project Manager + Fullstack Developer | Coordinates team workflow and timelines. Led friend requests, search engine, notification system, and user profiles, collaborating across real-time hooks and DB logic. |

---

## Project Management

### Organization

- **Task tracking**: GitHub Issues for feature requests and bug tracking, with labels for priority and module assignment.
- **Code reviews**: All features developed on feature branches with pull request reviews before merging to main.
- **Communication**: Discord server for daily async communication, weekly video calls for sprint planning and retrospectives.
- **Work distribution**: Each team member owns specific modules while contributing to shared infrastructure. All members participate in code reviews.

### Workflow

1. Features are broken down into GitHub Issues
2. Developer creates a feature branch from `main`
3. Implementation with incremental commits
4. Pull request with description and testing notes
5. Code review by at least one other team member
6. Merge to `main` after approval and CI checks pass

---

## Technical Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui (neobrutalism) | Next.js provides full-stack capabilities with SSR, reducing infrastructure complexity. React 19 offers the latest concurrent features. Tailwind + shadcn/ui enables rapid UI development with a consistent design system. |
| **Backend** | Next.js custom server, Socket.IO 4 | Single-process architecture allows shared session state between HTTP and WebSocket without external message brokers. |
| **Auth** | better-auth 1.6 (credentials + OAuth 2.0 + TOTP 2FA) | Comprehensive auth library that handles password hashing, session management, OAuth flows, and 2FA out of the box with minimal configuration. |
| **Database** | SQLite + Drizzle ORM 0.45 | SQLite is lightweight and requires no separate database server, ideal for the project scope. Drizzle provides type-safe SQL queries with minimal overhead. |
| **Validation** | Zod 4 + react-hook-form | Zod schemas are shared between client and server for consistent validation. react-hook-form provides performant form handling. |
| **Tooling** | TypeScript 5 (strict), Biome 2.4, pnpm | TypeScript strict mode catches type errors at compile time. Biome replaces ESLint + Prettier with a single fast tool. |
| **Deploy** | Docker + Docker Compose + Caddy (HTTPS) | Single `docker compose up` command starts the entire stack with automatic HTTPS via Caddy reverse proxy. |

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│     user     │       │   session    │       │     account      │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │       │ id (PK)          │
│ name         │   ├───│ user_id (FK) │   ┌───│ user_id (FK)     │
│ email (UQ)   │   │   │ token (UQ)   │   │   │ provider_id      │
│ username (UQ)│   │   │ expires_at   │   │   │ account_id       │
│ image        │   │   │ ip_address   │   │   │ access_token     │
│ 2fa_enabled  │   │   │ user_agent   │   │   │ refresh_token    │
│ last_seen_at │   │   └──────────────┘   │   └──────────────────┘
│ created_at   │   │                      │
│ updated_at   │   │   ┌──────────────┐   │   ┌──────────────────┐
└──────────────┘   │   │  two_factor  │   │   │  verification    │
       │           ├───│ user_id (FK) │   │   ├──────────────────┤
       │           │   │ secret       │   │   │ id (PK)          │
       │           │   │ backup_codes │   │   │ identifier       │
       │           │   │ verified     │   │   │ value            │
       │           │   └──────────────┘   │   │ expires_at       │
       │           │                      │   └──────────────────┘
       │           │   ┌────────────────────┐
       │           │   │  friend_request    │
       │           ├───│ sender_id (FK)     │
       │           └───│ receiver_id (FK)   │
       │               │ status             │  pending | accepted | rejected
       │               │ created_at         │
       │               └────────────────────┘
       │
       │  ┌─────────────────────┐        ┌──────────────────┐
       │  │    conversation     │        │     message      │
       ├──├─────────────────────┤        ├──────────────────┤
       ├──│ user_a_id (FK)      │◄───────│ conversation_id  │
       └──│ user_b_id (FK)      │    ┌───│ sender_id (FK)   │
          │ last_message_at     │    │   │ body             │
          │ user_a_last_read_at │    │   │ file_name        │
          │ user_b_last_read_at │    │   │ file_url         │
          └─────────────────────┘    │   │ file_type        │
                                     │   │ file_size        │
                                     │   │ created_at       │
                                     │   └──────────────────┘
```

**Key design decisions:**
- `conversation` uses normalized participant order (`user_a_id < user_b_id`) with a unique constraint to prevent duplicate conversations.
- `message` has no `receiver_id` — it's derived from the conversation (the other participant is the receiver).
- `last_message_at` is denormalized on `conversation` for efficient home page ordering.
- Online presence is tracked in-memory via Socket.IO registry, not stored in the database. `last_seen_at` serves as a fallback.

---

## Features List

| Feature | Description | Member(s) |
|---------|-------------|-----------|
| Landing page | Public landing page with project branding | fmartusc |
| User registration | Email/password signup with validation | edforte |
| User login | Email/password + OAuth 42 authentication | edforte |
| Two-Factor Auth | TOTP setup, verification, backup codes | edforte |
| User profiles | View/edit profile, avatar, friend count | lrocca |
| Friend requests | Send, accept, reject, cancel, unfriend | lrocca |
| Conversation list | Home page with chat list, friend grouping | vzashev, lrocca |
| Real-time chat | 1-to-1 messaging with Socket.IO | vzashev |
| File uploads | Share images, documents, videos in chat | vzashev |
| Message search | Search users and messages within conversations | lrocca |
| User search | Find new users to chat with | lrocca |
| Online presence | Real-time online/offline indicators | vzashev |
| Notifications | Unread count badges for messages and requests | lrocca |
| Read receipts | Track last read timestamp per conversation | vzashev |
| Design system | 19+ reusable neobrutalist components | fmartusc |
| Privacy Policy | Legal page with real content | fmartusc |
| Terms of Service | Legal page with real content | fmartusc |
| Docker deployment | Multi-stage Docker build + Compose + Caddy HTTPS | edforte |
| CI/CD | GitHub Actions for build verification + code quality | edforte |

---

## Modules

| Status | Category | Module | Type | Points | Justification |
|:------:|----------|--------|------|-------:|---------------|
| ✅ | Web | Full-Stack Framework (Next.js) | Major | 2 | Next.js 16 serves as both frontend (React 19, App Router, SSR) and backend (API routes, custom server). Single codebase, shared types. |
| ✅ | Web | Real-time features (Socket.IO) | Major | 2 | Socket.IO handles real-time messaging, presence tracking, and notification broadcasts. Graceful reconnection with exponential backoff. |
| ✅ | Web | User interactions (chat + profile + friends) | Major | 2 | Complete chat system (text + files), user profiles with avatar/friend count, mutual friend request system with accept/reject flow. |
| ✅ | Web | ORM (Drizzle) | Minor | 1 | Drizzle ORM provides type-safe database access with migration support. Schema defined in TypeScript with relations. |
| ✅ | Web | Custom design system (19+ components) | Minor | 1 | Custom-built neobrutalist component library styled from scratch using Tailwind CSS, inspired by shadcn/ui structures for semantic HTML and accessibility: Button, Input, Avatar, Card, Dialog, Toast, Sidebar, Badge, Skeleton, and 10+ more. |
| ✅ | Web | Server-Side Rendering (SSR) | Minor | 1 | Next.js App Router uses React Server Components by default. Layouts, legal pages, and the route proxy are server-rendered for performance and SEO. |
| ✅ | Web | File upload and management | Minor | 1 | Upload images, documents, and videos. Server-side validation (MIME type + magic bytes), secure storage, file preview in chat, access control per conversation. |
| ✅ | User Mgmt | Standard user management | Major | 2 | Profile editing, avatar upload with default fallback, friend system with online status, profile pages with user information. |
| ✅ | User Mgmt | OAuth 2.0 (42 Intra) | Minor | 1 | OAuth 2.0 Authorization Code flow via 42 Intra API. Automatic account linking if email exists. |
| ✅ | User Mgmt | Two-Factor Authentication (TOTP) | Minor | 1 | Complete 2FA flow: enable with password verification, TOTP QR code (generated locally), 6-digit verification, backup codes, disable with password. Login requires TOTP when enabled. |
| ✅ | Web | Notification System | Minor | 1 | Complete real-time notification badge system for messages and friend requests (creates, accepts, cancels, reads). |
| ✅ | Accessibility | Support for multiple languages (3 languages) | Minor | 1 | Client-side internationalization system (EN, IT, BG) with dynamic context-based translations, custom language switcher, and full localization. |
| ✅ | Accessibility | Support for additional browsers (Firefox, Safari, Edge) | Minor | 1 | Fully tested and compatible with modern rendering engines (Gecko/Firefox, WebKit/Safari, Chromium/Edge) using standard CSS grid/flexbox and stable React features. |
| ✅ | Gaming/UX | Gamification system | Minor | 1 | Custom persistent badges & achievements system on the profile page tracking message counts, 2FA setup, and friend counts with visual feedback and localized info. |
| ✅ | Devops | Health check & backups | Minor | 1 | Custom API health check endpoint (/api/health) and automated shell script backup scheduler (scripts/backup.sh) packaging DB state & user uploads. |
| ✅ | Data/Analytics | GDPR compliance features | Minor | 1 | Data export in structured JSON format, cookie consent notification banner, and permanent account deletion mechanism. |
| | | **Total** | | **20** | |

---

## Individual Contributions

*While each member was designated as the lead for specific modules to ensure clear ownership, the project was developed in a highly collaborative and cross-functional environment. All team members actively participated in code reviews, UI layout adjustments, backend logic debugging, and integration testing across all layers of the codebase.*

### fmartusc (Product Owner + Designer)
- Designed the neobrutalist visual identity and UI/UX
- Implemented the landing page (`app/page.tsx`) and global layout
- Designed and built the custom neobrutalist component library from scratch using Tailwind CSS (19+ components in `components/ui/`)
- Built Privacy Policy and Terms of Service pages with real content (`app/(legal)/`)
- Defined product backlog and feature priorities

### edforte (Technical Lead)
- Defined the technical architecture: Next.js custom server + Socket.IO single-process design
- Designed and implemented the database schema with Drizzle ORM (`schema/index.ts`, migrations)
- Implemented authentication: better-auth configuration, email/password, OAuth 42 integration (`lib/auth.ts`)
- Implemented Two-Factor Authentication: TOTP enable/disable/verify flow (`components/feature/settings/`)
- Set up Docker deployment with multi-stage build, Caddy HTTPS reverse proxy
- Configured CI/CD pipelines (GitHub Actions), TypeScript strict mode, Biome linting
- Led code quality reviews and refactoring efforts

### vzashev (Technical Lead)
- Implemented the Socket.IO real-time infrastructure: server setup, auth middleware, presence registry (`lib/socket/`, `server.ts`)
- Built the chat interface: message bubbles, input with file attachment, cursor-based pagination (`app/(app)/chat/`)
- Implemented file upload system: API endpoint, storage, access control, magic bytes validation (`app/api/uploads/`)
- Built real-time presence tracking: online/offline indicators, heartbeat, subscriber model
- Implemented read receipts and unread message counting
- Optimized conversation list queries for performance

### lrocca (Project Manager)
- Organized team workflow: GitHub Issues, PR review process, sprint planning
- Implemented friend request system: send, accept, reject, cancel, unfriend (`app/api/friend-requests/`, `app/(app)/requests/`)
- Built notification system: unread count badges, real-time updates via Socket.IO
- Implemented search functionality: global search (users + messages), user discovery page (`app/api/search/`, `app/(app)/search/`)
- Built user profile pages with friend status integration (`app/(app)/profile/`)
- Implemented conversation creation and home page chat list (`app/(app)/home/`)

---

## Instructions

### Prerequisites

- Docker and Docker Compose
- (Optional for local dev) Node.js 22+, pnpm 10+

### Quick Start (Docker — recommended)

```bash
# Clone the repository
git clone <repo-url>
cd trashydance

# Generate HTTPS certificates
bash certs/generate.sh

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your secrets (BETTER_AUTH_SECRET, 42 OAuth credentials)

# Start the application
docker compose up
```

The app will be available at **https://localhost:8443** (accept the self-signed certificate warning in your browser).
*Note: If running on a local machine with root privileges where ports 80/443 can be mapped, you can edit `compose.yaml` to bind `443:443` and access via `https://localhost`.*

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env (set BETTER_AUTH_URL=http://localhost:3000 for local dev)

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The dev server runs at `http://localhost:3000`.

### Running Tests

```bash
pnpm test          # Run unit and integration tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report
```

### 42 OAuth Setup

1. Create an OAuth application in the 42 Intra admin panel.
2. Set the callback URL to: `https://localhost:8443/api/auth/oauth2/callback/42`
3. Set `FORTYTWO_CLIENT_ID` and `FORTYTWO_CLIENT_SECRET` in your `.env` file.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Path to SQLite database file | Yes |
| `BETTER_AUTH_SECRET` | Secret key for session encryption (min 32 chars) | Yes |
| `BETTER_AUTH_URL` | Base URL of the application (`https://localhost:8443`) | Yes |
| `FORTYTWO_CLIENT_ID` | 42 OAuth client ID | For OAuth |
| `FORTYTWO_CLIENT_SECRET` | 42 OAuth client secret | For OAuth |
| `PORT` | Internal server port (default: 3000) | No |

---

## Resources

### Technologies and Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs) — App Router, Server Components, API Routes
- [React 19](https://react.dev/) — UI library with concurrent features
- [Socket.IO](https://socket.io/docs/) — Real-time bidirectional event-based communication
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM for SQL databases
- [better-auth](https://www.better-auth.com/) — Authentication library for TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) — Reusable component library
- [Zod](https://zod.dev/) — TypeScript-first schema validation
- [Caddy](https://caddyserver.com/) — HTTP/2 web server with automatic HTTPS
- [Biome](https://biomejs.dev/) — Fast linter and formatter

### AI Usage Disclosure

As required by the ft_transcendence project subject, we disclose the use of AI tools (ChatGPT, Claude, GitHub Copilot) during the development process:
- **Code Assistance & Boilerplate**: AI was used to generate initial boilerplate code for standard UI components (shadcn/ui variants) and Tailwind CSS utility class combinations.
- **Debugging & TypeScript**: AI assistants helped in resolving complex TypeScript generic errors and optimizing Drizzle ORM queries.
- **Documentation & Legal**: AI was used to assist in formatting Markdown tables in this README, creating the Architecture ASCII diagram, and drafting the initial structure for the Privacy Policy and Terms of Service.
- **Design Inspiration**: AI helped suggest color palettes and structural ideas for the neobrutalist aesthetic.
- *Note: All core logic, Socket.IO architecture, security implementations, and final code integrations were written, reviewed, and deeply understood by the team.*

---

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
           │ HTTPS        │ HTTPS         │ WSS
           ▼              ▼               ▼
┌──────────────────────────────────────────────────────────┐
│                   Caddy (Reverse Proxy)                   │
│                   TLS termination                        │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP (internal)
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js Custom Server                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  App Router      │  │  better-auth │  │ socket.io  │  │
│  │  (API Routes +   │  │  (sessions,  │  │ (real-time │  │
│  │   Server Comps)  │  │   OAuth, 2FA)│  │  messages) │  │
│  └────────┬─────────┘  └──────┬───────┘  └─────┬──────┘  │
│           │                   │                 │         │
│           ▼                   ▼                 ▼         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Drizzle ORM + Rate Limiter            │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    SQLite    │
                    └──────────────┘
```

---

## License

This project is developed as part of the 42 school curriculum.
