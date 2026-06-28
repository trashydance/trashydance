"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BlackHoleIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<title>Black Hole</title>
			<circle cx="12" cy="12" r="3.5" fill="currentColor" />
			<path d="M12 2a10 10 0 0 1 8 4M22 12a10 10 0 0 1-4 8M12 22a10 10 0 0 1-8-4M2 12a10 10 0 0 1 4-8" />
			<path d="M12 5a7 7 0 0 1 5.6 2.8M19 12a7 7 0 0 1-2.8 5.6M12 19a7 7 0 0 1-5.6-2.8M5 12a7 7 0 0 1 2.8-5.6" />
		</svg>
	);
}

interface BlackHoleToggleProps {
	isActive: boolean;
	onToggle: () => void;
	disabled?: boolean;
}

export function BlackHoleToggle({
	isActive,
	onToggle,
	disabled,
}: BlackHoleToggleProps) {
	return (
		<Button
			size="icon-sm"
			variant={isActive ? "default" : "outline"}
			onClick={onToggle}
			disabled={disabled}
			title={
				isActive
					? "Black Hole Mode ON — messages are ephemeral"
					: "Activate Black Hole Mode"
			}
			className={cn(
				"transition-all",
				isActive && "bg-destructive hover:bg-destructive/90",
			)}
		>
			<BlackHoleIcon
				className={cn(
					"size-4",
					isActive && "animate-spin [animation-duration:8s]",
				)}
			/>
		</Button>
	);
}
