"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function LegalLayout({ children }: { children: ReactNode }) {
	const { t } = useI18n();
	return (
		<div className="min-h-screen bg-background">
			<nav className="border-b border-border p-4">
				<Link
					href="/"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					{t("backToTrashy")}
				</Link>
			</nav>
			{children}
		</div>
	);
}
