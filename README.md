*This project has been created as part of the 42 curriculum by edforte, fmartusc, lrocca, vzashev*

# Trashydance

## Description

## Instructions

### Local Development

Requirements:

- Node.js
- pnpm

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and add your environment variables
4. Run database migrations: `pnpm drizzle-kit migrate`
5. Start the development server: `pnpm dev`

### 42 OAuth Setup

This project supports OAuth via 42 Intra.

1. Create an OAuth application in 42.
2. Add this callback URL in your 42 app settings:
	- `http://localhost:3000/api/auth/oauth2/callback/42`
3. Set these variables in your local `.env`:
	- `FORTYTWO_CLIENT_ID`
	- `FORTYTWO_CLIENT_SECRET`

## Resources

## Team Information

- edforte
	- Technical Lead
	- Developer
- fmartusc
	- Product Owner
	- Developer
	- Designer
- lrocca
	- Project Manager
	- Developer
- vzashev
	- Technical Lead
	- Developer

## Project Management

## Technical Stack

- Database: SQLite
- Full Stack Framework: Next.js
- Styling: TailwindCSS
- UI Components: ShadcnUI
- Libraries
	- ORM: Drizzle
	- Authentication: BetterAuth
	- Forms: React Hook Form
	- Validation: zod

## Database Schema

## Features List

## Modules

| Status | Section   | Module                                           | Type    | Points |
|:------:|-----------|--------------------------------------------------|---------|-------:|
| OK     | Web       | Full-Stack framework                             | Major   |      2 |
|        | Web       | Real-time features using WebSockets              | Major   |      2 |
|        | Web       | User interactions (basic chat, profile, friends) | Major   |      2 |
| OK     | Web       | ORM                                              | _Minor_ |      1 |
| ?      | Web       | Custom design system                             | _Minor_ |      1 |
|        | User Mgmt | Standard user management                         | Major   |      2 |
|        | User Mgmt | Game statistics and match history                | _Minor_ |      1 |
| OK     | User Mgmt | OAuth 2.0                                        | _Minor_ |      1 |
|        | User Mgmt | 2 Factor Authentication                          | _Minor_ |      1 |
|        | Gaming    | Web-based game                                   | Major   |      2 |
|        | Gaming    | Remote players                                   | Major   |      2 |
|        | Gaming    | Multiplayer game                                 | Major   |      2 |
| ?      | Gaming    | Advanced chat features                           | _Minor_ |      1 |
|        | **Total** |                                                  |         | **20** |

## Individual Contributions
