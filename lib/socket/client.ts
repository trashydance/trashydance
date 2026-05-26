"use client";

import { io, type Socket } from "socket.io-client";
import {
	SOCKET_RECONNECTION_ATTEMPTS,
	SOCKET_RECONNECTION_DELAY,
} from "@/lib/constants";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 * Connects lazily on first call.
 */
export function getSocket(): Socket {
	if (!socket) {
		socket = io({
			path: "/socket.io",
			transports: ["websocket", "polling"],
			autoConnect: true,
			reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
			reconnectionDelay: SOCKET_RECONNECTION_DELAY,
		});
		socket.on("connect_error", () => {});
	}
	return socket;
}

/**
 * Disconnect and destroy the singleton socket.
 */
export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
