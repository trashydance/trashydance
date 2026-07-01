"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n/i18n-context";

export function BrandLogo() {
	const { toast } = useToast();
	const { t } = useI18n();
	const [isFlipping, setIsFlipping] = useState(false);

	const handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (isFlipping) return;

		setIsFlipping(true);
		const isHeads = Math.random() < 0.5;

		setTimeout(() => {
			toast(isHeads ? t("coinFlipHeads") : t("coinFlipTails"), "info");
			setIsFlipping(false);
		}, 1000);
	};

	return (
		<div className="flex shrink-0 items-center gap-2">
			<style>{`
				@keyframes coin-flip-3d {
					0% { transform: rotateY(0deg); }
					100% { transform: rotateY(1800deg); }
				}
				.coin-flip-animation {
					animation: coin-flip-3d 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
				}
			`}</style>
			<button
				type="button"
				onClick={handleLogoClick}
				className={`flex size-10 items-center justify-center border-2 border-border bg-main font-heading text-sm text-main-foreground shadow-brutal transition-all ${
					isFlipping ? "coin-flip-animation" : ""
				}`}
				aria-label="Flip logo coin"
			>
				TD
			</button>
			<Link
				href="/home"
				className="hidden text-xl font-bold uppercase tracking-tight sm:inline hover:underline"
			>
				Trashy<span className="text-secondary">dance</span>
			</Link>
		</div>
	);
}
