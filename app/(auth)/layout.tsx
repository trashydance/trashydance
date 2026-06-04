import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-svh flex-col">
			<header className="border-b-4 border-border bg-background">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
					<Link href="/" className="flex shrink-0 items-center gap-2">
						<span className="flex size-10 items-center justify-center border-4 border-border bg-main font-heading text-sm text-main-foreground">
							TD
						</span>
						<span className="text-xl font-bold uppercase tracking-tight">
							Trashy<span className="text-secondary">dance</span>
						</span>
					</Link>
				</div>
			</header>

			<main className="flex flex-1 items-center justify-center px-4 py-10">
				{children}
			</main>

			<footer className="border-t-4 border-border bg-background">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
					<p className="text-xs font-bold uppercase tracking-wide">
						© 2026 Trashydance · 42 Final Project
					</p>
					<div className="flex items-center gap-4">
						<Link
							href="/privacy"
							className="text-xs text-muted-foreground hover:text-foreground hover:underline"
						>
							Privacy
						</Link>
						<Link
							href="/terms"
							className="text-xs text-muted-foreground hover:text-foreground hover:underline"
						>
							Terms
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
