"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MoulinetteResult } from "@/lib/utils/moulinette";
import { generateMoulinetteResult } from "@/lib/utils/moulinette";

interface MoulinetteOverlayProps {
	isOpen: boolean;
	onClose: () => void;
}

export function MoulinetteOverlay({ isOpen, onClose }: MoulinetteOverlayProps) {
	const [phase, setPhase] = useState<"testing" | "result">("testing");
	const [result, setResult] = useState<MoulinetteResult | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setPhase("testing");
			setResult(null);
			return;
		}

		// Generate result immediately
		setResult(generateMoulinetteResult());

		// After 1.5s, show result
		const phaseTimer = setTimeout(() => {
			setPhase("result");
		}, 1500);

		// After 3.5s total, close overlay
		const closeTimer = setTimeout(() => {
			onClose();
		}, 3500);

		return () => {
			clearTimeout(phaseTimer);
			clearTimeout(closeTimer);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
			{/* Overlay background */}
			<motion.div
				className="absolute inset-0 bg-black/40"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			/>

			{/* Content container */}
			<motion.div
				className="relative pointer-events-auto flex flex-col items-center gap-4 rounded-lg border-2 border-accent bg-card p-6 shadow-2xl max-w-sm"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.8, opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				{/* Testing phase */}
				{phase === "testing" && (
					<motion.div
						className="flex flex-col items-center gap-3"
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							className="text-4xl"
						>
							🤖
						</motion.div>
						<div className="text-center">
							<p className="font-bold uppercase tracking-wide">
								Moulinette Testing...
							</p>
							<p className="text-xs text-muted-foreground">
								Evaluating your message
							</p>
						</div>

						{/* Progress bar */}
						<motion.div
							className="w-full h-1 bg-muted rounded-full overflow-hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						>
							<motion.div
								className="h-full bg-accent"
								initial={{ width: "0%" }}
								animate={{ width: "100%" }}
								transition={{ duration: 1.5, ease: "easeInOut" }}
							/>
						</motion.div>
					</motion.div>
				)}

				{/* Result phase */}
				{phase === "result" && result && (
					<motion.div
						className="flex flex-col items-center gap-3 text-center"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4 }}
					>
						<div className="text-5xl">{result.icon}</div>
						<div>
							<p className="font-bold uppercase tracking-wide">
								{result.message}
							</p>
							{result.score !== undefined && (
								<p
									className={`text-sm font-bold mt-1 ${
										result.status === "ok" || result.score >= 50
											? "text-green-500"
											: "text-red-500"
									}`}
								>
									Score: {result.score}%
								</p>
							)}
						</div>

						{/* Motivational message based on status */}
						<p className="text-xs text-muted-foreground italic">
							{result.status === "ok"
								? "Excellent work! 🎉"
								: result.status === "timeout"
									? "Too slow, you need to optimize!"
									: result.status === "segfault"
										? "Something went terribly wrong..."
										: "Keep practicing, you'll get there! 💪"}
						</p>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
