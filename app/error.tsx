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
		<html lang="en">
			<body className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<div className="flex flex-col items-center gap-4 p-8 text-center">
					<AlertTriangle className="size-12 text-destructive" />
					<h2 className="text-2xl font-bold">Something went wrong</h2>
					<p className="text-muted-foreground">
						An unexpected error occurred. Please try again.
					</p>
					<button
						type="button"
						onClick={reset}
						className="rounded-base border-2 border-border bg-foreground px-4 py-2 text-background shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
