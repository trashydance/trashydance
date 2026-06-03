import type { Server as SocketIOServer } from "socket.io";

declare global {
	var __socketIO: SocketIOServer | undefined;
}

export function setIO(io: SocketIOServer) {
	globalThis.__socketIO = io;
}

export function getIO(): SocketIOServer | null {
	return globalThis.__socketIO ?? null;
}
