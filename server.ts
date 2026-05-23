import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketHandlers } from "@/lib/socket/handlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

export let io: SocketIOServer;

app.prepare().then(() => {
	const httpServer = createServer(handle);

	io = new SocketIOServer(httpServer, {
		path: "/socket.io",
		transports: ["websocket", "polling"],
	});

	setupSocketHandlers(io);

	httpServer.listen(port, hostname, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
