import { z } from "zod";

/**
 * Server-side environment variables, validated with fail-fast semantics.
 * Call `getEnv()` after .env has been loaded (Next does this in `app.prepare()`).
 */
const envSchema = z.object({
	BETTER_AUTH_SECRET: z
		.string()
		.min(
			32,
			"BETTER_AUTH_SECRET must be at least 32 characters (generate one with: openssl rand -hex 32)",
		),
	BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
	FORTYTWO_CLIENT_ID: z.string().min(1, "FORTYTWO_CLIENT_ID is required"),
	FORTYTWO_CLIENT_SECRET: z
		.string()
		.min(1, "FORTYTWO_CLIENT_SECRET is required"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
	if (!cached) {
		const parsed = envSchema.safeParse(process.env);
		if (!parsed.success) {
			const issues = parsed.error.issues
				.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
				.join("\n");
			throw new Error(`Invalid or missing environment variables:\n${issues}`);
		}
		cached = parsed.data;
	}
	return cached;
}
