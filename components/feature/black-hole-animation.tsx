"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BlackHoleAnimationProps {
	isActive: boolean;
	onAbsorb: () => void;
	messageCount: number;
	isAbsorbing?: boolean;
}

export function BlackHoleAnimation({
	isActive,
	onAbsorb,
	messageCount,
	isAbsorbing = false,
}: BlackHoleAnimationProps) {
	const [isClicked, setIsClicked] = useState(false);

	useEffect(() => {
		if (isAbsorbing) {
			setIsClicked(true);
		} else {
			setIsClicked(false);
		}
	}, [isAbsorbing]);

	useEffect(() => {
		if (isClicked) {
			const timer = setTimeout(() => {
				onAbsorb();
				setIsClicked(false);
			}, 1200);
			return () => clearTimeout(timer);
		}
	}, [isClicked, onAbsorb]);

	if (!isActive) return null;

	return (
		<div className="absolute top-[35%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
			<motion.div
				className="relative w-24 h-24 cursor-pointer group pointer-events-auto"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => setIsClicked(true)}
			>
				{/* Outer accretion disk (rotating) */}
				<motion.div
					className="absolute rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-blue-600/20 blur-[2px]"
					style={{
						width: "220px",
						height: "220px",
						top: "-62px",
						left: "-62px",
					}}
					animate={{ rotate: 360 }}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>

				{/* Middle event horizon swirl */}
				<motion.div
					className="absolute rounded-full border border-purple-400/40 border-dashed"
					style={{
						width: "160px",
						height: "160px",
						top: "-32px",
						left: "-32px",
					}}
					animate={{ rotate: -360 }}
					transition={{
						duration: 12,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>

				{/* Core (Singularity) */}
				<motion.div
					className="w-24 h-24 rounded-full bg-black shadow-[0_0_40px_rgba(168,85,247,0.75)] flex items-center justify-center border-2 border-purple-500 black-hole-singularity"
					animate={{
						scale: isClicked ? 1.8 : 1,
						boxShadow: isClicked
							? "0 0 60px rgba(236,72,153,0.95)"
							: "0 0 40px rgba(168,85,247,0.75)",
					}}
					transition={{ duration: 0.5 }}
				>
					<span className="text-xl select-none">🕳️</span>
				</motion.div>

				{/* Floating text on hover */}
				<div className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/85 border border-purple-500/50 text-xs font-bold text-purple-300 px-3 py-1.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
					Absorb All ({messageCount})
				</div>
			</motion.div>
		</div>
	);
}
