"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function RootError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
			<div className="flex flex-col items-center gap-4 p-8 text-center">
				<AlertTriangle className="size-12 text-destructive" />
				<h2 className="text-2xl font-bold">Something went wrong</h2>
				<p className="text-muted-foreground">
					An unexpected error occurred. Please try again.
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-base border-2 border-border bg-foreground px-4 py-2 text-background shadow-shadow transition-all hover:brutal-press-hover"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
