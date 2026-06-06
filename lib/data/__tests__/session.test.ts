import { beforeEach, describe, expect, it, vi } from "vitest";

function mockAuthSession(userId: string | null) {
	vi.doMock("@/lib/auth-session", () => ({
		getAuthSession: vi.fn().mockResolvedValue(
			userId
				? {
						user: { id: userId, name: "Test User", email: "test@test.com" },
						session: { id: "session-1", token: "tok" },
					}
				: null,
		),
	}));
}

function mockRedirect() {
	const redirect = vi.fn((url: string) => {
		throw new Error(`NEXT_REDIRECT:${url}`);
	});
	vi.doMock("next/navigation", () => ({ redirect }));
	return redirect;
}

describe("lib/data/session", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	describe("getCurrentUser", () => {
		it("returns the session user when authenticated", async () => {
			mockAuthSession("user-1");
			mockRedirect();
			const { getCurrentUser } = await import("@/lib/data/session");

			const user = await getCurrentUser();

			expect(user?.id).toBe("user-1");
		});

		it("returns null when unauthenticated", async () => {
			mockAuthSession(null);
			mockRedirect();
			const { getCurrentUser } = await import("@/lib/data/session");

			const user = await getCurrentUser();

			expect(user).toBeNull();
		});
	});

	describe("requireUser", () => {
		it("returns the user when authenticated", async () => {
			mockAuthSession("user-1");
			const redirect = mockRedirect();
			const { requireUser } = await import("@/lib/data/session");

			const user = await requireUser();

			expect(user.id).toBe("user-1");
			expect(redirect).not.toHaveBeenCalled();
		});

		it("redirects to /login when unauthenticated", async () => {
			mockAuthSession(null);
			const redirect = mockRedirect();
			const { requireUser } = await import("@/lib/data/session");

			await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/login");
			expect(redirect).toHaveBeenCalledWith("/login");
		});
	});
});
