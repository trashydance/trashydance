import { describe, expect, it } from "vitest";
import { presence } from "@/lib/socket/presence";

// The presence registry is stored on globalThis and shared across tests,
// so every test uses unique userIds to stay isolated.

describe("presence.addSocket", () => {
	it("returns true only for the first socket of a user", () => {
		expect(presence.addSocket("add-user", "socket-1")).toBe(true);
		expect(presence.addSocket("add-user", "socket-2")).toBe(false);
		expect(presence.addSocket("add-user", "socket-3")).toBe(false);
	});
});

describe("presence.removeSocket", () => {
	it("returns true only when removing the last socket of a user", () => {
		presence.addSocket("remove-user", "socket-1");
		presence.addSocket("remove-user", "socket-2");

		expect(presence.removeSocket("remove-user", "socket-1")).toBe(false);
		expect(presence.removeSocket("remove-user", "socket-2")).toBe(true);
	});

	it("returns false when removing a socket for an unknown user", () => {
		expect(presence.removeSocket("unknown-user", "socket-1")).toBe(false);
	});
});

describe("presence.getSocketIds", () => {
	it("returns all socket ids for a user", () => {
		presence.addSocket("ids-user", "socket-1");
		presence.addSocket("ids-user", "socket-2");

		const ids = presence.getSocketIds("ids-user");
		expect(ids).toBeInstanceOf(Set);
		expect([...ids].sort()).toEqual(["socket-1", "socket-2"]);
	});

	it("returns an empty set for a user with no sockets", () => {
		expect(presence.getSocketIds("no-sockets-user").size).toBe(0);
	});
});

describe("presence.isOnline", () => {
	it("reflects whether a user has active sockets", () => {
		expect(presence.isOnline("online-user")).toBe(false);
		presence.addSocket("online-user", "socket-1");
		expect(presence.isOnline("online-user")).toBe(true);
		presence.removeSocket("online-user", "socket-1");
		expect(presence.isOnline("online-user")).toBe(false);
	});
});

describe("presence.getOnlineUsers", () => {
	it("returns only the users that are currently online", () => {
		presence.addSocket("group-online-1", "socket-1");
		presence.addSocket("group-online-2", "socket-1");

		const result = presence.getOnlineUsers([
			"group-online-1",
			"group-offline",
			"group-online-2",
		]);
		expect(result.sort()).toEqual(["group-online-1", "group-online-2"]);
	});
});
