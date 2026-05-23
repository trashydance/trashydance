"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

export function useSocket() {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!globalSocket) {
			globalSocket = io({
				path: "/api/socket",
				autoConnect: true,
			});
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

	return { socket: socketRef.current, isConnected };
}
