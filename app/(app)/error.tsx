"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
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
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
			<AlertTriangle className="size-12 text-destructive" />
			<h2 className="font-heading text-2xl font-bold">Something went wrong</h2>
			<p className="text-muted-foreground">
				An unexpected error occurred. Please try again.
			</p>
			<Button onClick={reset}>Try again</Button>
		</div>
	);
}
