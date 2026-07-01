"use client";

import { useEffect, useState } from "react";

interface ActivePiece {
	id: number;
	left: number; // horizontal percentage position
	shapeIndex: number;
	speed: number; // duration in seconds
}

const SHAPES = [
	// I
	{
		grid: [[1, 1, 1, 1]],
		color: "bg-[#00f0f0]",
	},
	// J
	{
		grid: [
			[1, 0, 0],
			[1, 1, 1],
		],
		color: "bg-[#0000f0]",
	},
	// L
	{
		grid: [
			[0, 0, 1],
			[1, 1, 1],
		],
		color: "bg-[#f0a000]",
	},
	// O
	{
		grid: [
			[1, 1],
			[1, 1],
		],
		color: "bg-[#f0f000]",
	},
	// S
	{
		grid: [
			[0, 1, 1],
			[1, 1, 0],
		],
		color: "bg-[#00f000]",
	},
	// T
	{
		grid: [
			[0, 1, 0],
			[1, 1, 1],
		],
		color: "bg-[#a000f0]",
	},
	// Z
	{
		grid: [
			[1, 1, 0],
			[0, 1, 1],
		],
		color: "bg-[#f00000]",
	},
];

function TetrisPiece({ shapeIndex }: { shapeIndex: number }) {
	const shape = SHAPES[shapeIndex];
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(${shape.grid[0].length}, minmax(0, 1fr))`,
			}}
			className="gap-0.5 border-2 border-black p-0.5 bg-black/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
		>
			{shape.grid.flatMap((row, rIdx) =>
				row.map((cell, cIdx) =>
					cell ? (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: keys are static and deterministic
							key={`${rIdx}-${cIdx}`}
							className={`w-3 h-3 ${shape.color} border border-black shadow-[0.5px_0.5px_0px_0px_rgba(0,0,0,1)]`}
						/>
					) : (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: keys are static and deterministic
							key={`${rIdx}-${cIdx}`}
							className="w-3 h-3 bg-transparent"
						/>
					),
				),
			)}
		</div>
	);
}

export function TetrisEasterEgg() {
	const [pieces, setPieces] = useState<ActivePiece[]>([]);

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		function triggerSpawn() {
			const newPiece: ActivePiece = {
				id: Date.now() + Math.random(),
				left: Math.random() * 85 + 5, // Keep within 5% - 90% viewport width
				shapeIndex: Math.floor(Math.random() * SHAPES.length),
				speed: Math.random() * 4 + 4, // 4s to 8s fall speed
			};

			setPieces((prev) => [...prev, newPiece]);

			// Clean up this piece from state after its animation finishes
			setTimeout(
				() => {
					setPieces((prev) => prev.filter((p) => p.id !== newPiece.id));
				},
				newPiece.speed * 1000 + 500,
			);

			// Schedule next spawn randomly between 40s and 90s
			const nextDelay = Math.random() * 50000 + 40000;
			timeoutId = setTimeout(triggerSpawn, nextDelay);
		}

		// Initial spawn delayed by 30 seconds
		timeoutId = setTimeout(triggerSpawn, 30000);

		return () => clearTimeout(timeoutId);
	}, []);

	return (
		<>
			<style>{`
				@keyframes fall-and-spin {
					0% {
						transform: translateY(-120px) rotate(0deg);
						opacity: 0;
					}
					10% {
						opacity: 1;
					}
					90% {
						opacity: 1;
					}
					100% {
						transform: translateY(115vh) rotate(360deg);
						opacity: 0;
					}
				}
			`}</style>
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="fixed z-[9999] pointer-events-none top-0"
					style={{
						left: `${piece.left}%`,
						animation: `fall-and-spin ${piece.speed}s linear forwards`,
					}}
				>
					<TetrisPiece shapeIndex={piece.shapeIndex} />
				</div>
			))}
		</>
	);
}
