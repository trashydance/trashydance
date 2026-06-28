import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { getEnv } from "@/lib/env";
import { setupSocketHandlers } from "@/lib/socket/handlers";
import { setIO } from "@/lib/socket/io-instance";

const dev = process.env.NODE_ENV !== "production";

function parseHostname(value?: string): string {
	// Use localhost by default in development so the browser origin matches
	// Better Auth's local origin checks and avoids `Invalid origin: http://0.0.0.0:3000`.
	if (!value) return "localhost";
	if (value.length === 0 || value.length > 255 || /\s/.test(value)) {
		throw new Error(`Invalid HOSTNAME environment variable: ${value}`);
	}
	return value;
}

const hostname = parseHostname(process.env.HOSTNAME);

function parsePort(value?: string): number {
	if (!value) return 3000;
	const n = Number(value);
	if (!Number.isInteger(n) || n <= 0 || n > 65535) {
		throw new Error(`Invalid PORT environment variable: ${value}`);
	}
	return n;
}

const port = parsePort(process.env.PORT);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	// .env is loaded via `--env-file` in dev (see package.json) and injected by
	// compose.yaml in production; fail fast if anything is missing.
	const env = getEnv();

	const httpServer = createServer(handle);

	const corsOrigin = env.BETTER_AUTH_URL;

	const io = new SocketIOServer(httpServer, {
		path: "/socket.io",
		transports: ["polling", "websocket"],
		cors: {
			origin: corsOrigin,
			credentials: true,
		},
	});

	setIO(io);
	setupSocketHandlers(io);

	httpServer.listen(port, hostname, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
