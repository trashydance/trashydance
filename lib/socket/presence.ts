/** In-memory presence registry mapping userId → Set of socketIds */
class PresenceRegistry {
	private registry = new Map<string, Set<string>>();

	/**
	 * Register a socket for a user.
	 * @returns `true` if the user just came online (had zero sockets before).
	 */
	addSocket(userId: string, socketId: string): boolean {
		const existing = this.registry.get(userId);
		if (existing) {
			existing.add(socketId);
			return false;
		}
		this.registry.set(userId, new Set([socketId]));
		return true;
	}

	/**
	 * Remove a socket for a user.
	 * @returns `true` if the user went fully offline (no remaining sockets).
	 */
	removeSocket(userId: string, socketId: string): boolean {
		const sockets = this.registry.get(userId);
		if (!sockets) return false;

		sockets.delete(socketId);
		if (sockets.size === 0) {
			this.registry.delete(userId);
			return true;
		}
		return false;
	}

	/** Check if a user has at least one active socket. */
	isOnline(userId: string): boolean {
		const sockets = this.registry.get(userId);
		return sockets !== undefined && sockets.size > 0;
	}

	/** Given a list of userIds, return only those currently online. */
	getOnlineUsers(userIds: string[]): string[] {
		return userIds.filter((id) => this.isOnline(id));
	}

	/** Get all socket ids for a given user. */
	getSocketIds(userId: string): Set<string> {
		return this.registry.get(userId) ?? new Set();
	}
}

declare global {
	var __presenceRegistry: PresenceRegistry | undefined;
}

if (!globalThis.__presenceRegistry) {
	globalThis.__presenceRegistry = new PresenceRegistry();
}

export const presence = globalThis.__presenceRegistry;
