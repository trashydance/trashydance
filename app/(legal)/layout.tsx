import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<nav className="border-b border-border p-4">
				<Link
					href="/"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					&larr; Back to trashydance
				</Link>
			</nav>
			{children}
		</div>
	);
}
