/**
 * Moulinette — 42-themed message grading with random results
 */

export interface MoulinetteResult {
	status: "ok" | "ko" | "segfault" | "timeout" | "needs_improvement";
	score?: number;
	message: string;
	icon: string;
}

const RESULTS: MoulinetteResult[] = [
	{ status: "ok", score: 100, message: "✓ OK 100%", icon: "✅" },
	{ status: "ko", score: 0, message: "✗ KO — Compilation Error", icon: "❌" },
	{
		status: "segfault",
		message: "⚠️ Segmentation Fault (core dumped)",
		icon: "💥",
	},
	{ status: "timeout", message: "⏱️ Timeout — Infinite Loop", icon: "⏱️" },
	{
		status: "needs_improvement",
		score: 42,
		message: "🤨 Needs Improvement — Please retry",
		icon: "🤨",
	},
	{ status: "ko", score: 25, message: "✗ Compilation Warning", icon: "⚠️" },
	{ status: "ok", score: 95, message: "✓ Almost Perfect!", icon: "⭐" },
];

export function generateMoulinetteResult(): MoulinetteResult {
	return RESULTS[Math.floor(Math.random() * RESULTS.length)];
}
