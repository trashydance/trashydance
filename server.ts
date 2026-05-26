import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketHandlers } from "@/lib/socket/handlers";
import { setIO } from "@/lib/socket/io-instance";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handle);

	const corsOrigin =
		process.env.BETTER_AUTH_URL ||
		`http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port}`;

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
