import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Dummy values so modules guarded by lib/env.ts can be imported in tests.
process.env.BETTER_AUTH_SECRET ??= "test-secret-0123456789abcdef0123456789";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.FORTYTWO_CLIENT_ID ??= "test-client-id";
process.env.FORTYTWO_CLIENT_SECRET ??= "test-client-secret";

afterEach(() => {
	// Smonta i componenti renderizzati da Testing Library (necessario senza `globals`).
	cleanup();
	vi.restoreAllMocks();
});
