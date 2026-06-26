import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function NotFoundContent() {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="flex size-20 items-center justify-center border-4 border-border bg-main shadow-brutal">
				<AlertCircle className="size-10 text-main-foreground" />
			</div>
			<h1 className="font-heading text-6xl tracking-tight sm:text-7xl">404</h1>
			<h2 className="font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
				Page not found
			</h2>
			<p className="max-w-md text-sm font-medium text-muted-foreground sm:text-base">
				The page you are looking for does not exist or has been moved.
			</p>
			<Link
				href="/home"
				className="inline-flex h-12 items-center justify-center border-2 border-border bg-main px-8 font-heading text-sm font-bold uppercase tracking-wider text-main-foreground shadow-brutal transition-all hover:brutal-press-hover"
			>
				Back to home
			</Link>
		</div>
	);
}
