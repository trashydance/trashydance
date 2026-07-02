"use client";

import Link from "next/link";
import { COPYRIGHT_NOTICE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/i18n-context";

export function AppFooter() {
	const { t } = useI18n();
	return (
		<footer className="border-t-2 border-border bg-background">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
				<p className="text-xs font-bold uppercase tracking-wide">
					{COPYRIGHT_NOTICE}
				</p>
				<div className="flex items-center gap-4">
					<Link
						href="/privacy"
						className="text-xs text-muted-foreground hover:text-foreground hover:underline"
					>
						{t("privacy")}
					</Link>
					<Link
						href="/terms"
						className="text-xs text-muted-foreground hover:text-foreground hover:underline"
					>
						{t("terms")}
					</Link>
				</div>
			</div>
		</footer>
	);
}
