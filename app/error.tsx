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
					<AlertTriangle className="size-12 text-red-500" />
					<h2 className="text-2xl font-bold">Something went wrong</h2>
					<p className="text-gray-600">
						An unexpected error occurred. Please try again.
					</p>
					<button
						type="button"
						onClick={reset}
						className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
