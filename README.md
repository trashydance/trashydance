## 42 OAuth Setup

This project supports OAuth via 42 Intra.

1. Create an OAuth application in 42.
2. Add this callback URL in your 42 app settings:
	- `http://localhost:3000/api/auth/oauth2/callback/42`
3. Set these variables in your local `.env`:
	- `FORTYTWO_CLIENT_ID`
	- `FORTYTWO_CLIENT_SECRET`
