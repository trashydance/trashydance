import { afterEach, vi } from "vitest";

// server-only throws outside the RSC runtime (vitest runs under the
// default export condition) — stub it so DAL modules can be imported.
vi.mock("server-only", () => ({}));

afterEach(() => {
	vi.restoreAllMocks();
});
