import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
	test: {
		environment: "happy-dom",
		include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
		exclude: ["node_modules", ".next", ".claude", "drizzle", "e2e", "cypress"],
		setupFiles: ["./test/setup.ts"],
	},
});
