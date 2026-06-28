"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatWithNorminette } from "@/lib/utils/norminette";

interface NorminetteButtonProps {
	currentText: string;
	onFormat: (formattedText: string) => void;
	disabled?: boolean;
	className?: string;
}

export function NorminetteButton({
	currentText,
	onFormat,
	disabled,
	className,
}: NorminetteButtonProps) {
	const [showPreview, setShowPreview] = useState(false);
	const [previewText, setPreviewText] = useState("");

	const handleClick = useCallback(() => {
		if (!currentText.trim()) return;

		const formatted = formatWithNorminette(currentText);
		setPreviewText(formatted);
		setShowPreview(true);

		// Auto-apply after 1.5 seconds
		const timer = setTimeout(() => {
			onFormat(formatted);
			setShowPreview(false);
		}, 1500);

		return () => clearTimeout(timer);
	}, [currentText, onFormat]);

	const handleApplyNow = useCallback(() => {
		const formatted = formatWithNorminette(currentText);
		onFormat(formatted);
		setShowPreview(false);
	}, [currentText, onFormat]);

	const handleCancel = useCallback(() => {
		setShowPreview(false);
	}, []);

	return (
		<div className={cn("relative", className)}>
			<Button
				size="sm"
				variant="outline"
				onClick={handleClick}
				disabled={disabled || !currentText.trim()}
				type="button"
				title="Format with Norminette (42 style)"
				className="h-8"
			>
				Norm
			</Button>

			{showPreview && (
				<div className="absolute bottom-12 right-0 z-50 w-64 max-h-40 overflow-y-auto rounded-md border-2 border-accent bg-card p-2 shadow-lg">
					<p className="mb-2 text-xs font-bold text-accent">Preview:</p>
					<pre className="whitespace-pre-wrap break-words text-xs text-foreground">
						{previewText}
					</pre>
					<div className="mt-2 flex gap-2">
						<Button
							size="sm"
							variant="default"
							onClick={handleApplyNow}
							className="flex-1 h-6 text-xs"
						>
							Apply
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleCancel}
							className="flex-1 h-6 text-xs"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
