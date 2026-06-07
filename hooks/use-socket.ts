"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
	SOCKET_RECONNECTION_ATTEMPTS,
	SOCKET_RECONNECTION_DELAY,
} from "@/lib/constants";

let globalSocket: Socket | null = null;

export function useSocket() {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!globalSocket) {
			globalSocket = io({
				path: "/socket.io",
				transports: ["polling", "websocket"],
				autoConnect: true,
				withCredentials: true,
				reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
				reconnectionDelay: SOCKET_RECONNECTION_DELAY,
			});
			globalSocket.on("connect_error", () => {});
		}

		const socket = globalSocket;
		socketRef.current = socket;

		function onConnect() {
			setIsConnected(true);
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		if (socket.connected) {
			setIsConnected(true);
		} else {
			socket.connect();
		}

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	// Explicit teardown (e.g. logout). Transient/automatic disconnects must NOT
	// destroy the singleton, otherwise the next mount creates a duplicate socket.
	const disconnect = useCallback(() => {
		globalSocket?.disconnect();
		globalSocket = null;
		socketRef.current = null;
		setIsConnected(false);
	}, []);

	return { socket: socketRef.current, isConnected, disconnect };
}
