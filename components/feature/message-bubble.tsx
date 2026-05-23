"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface MessageBubbleProps {
	body: string;
	createdAt: string;
	isSelf: boolean;
	status?: "sending" | "sent" | "error";
	onRetry?: () => void;
}

export function MessageBubble({
	body,
	createdAt,
	isSelf,
	status,
	onRetry,
}: MessageBubbleProps) {
	return (
		<div
			className={cn("flex w-full", isSelf ? "justify-end" : "justify-start")}
		>
			<div
				className={cn(
					"max-w-[75%] rounded-lg border-2 border-foreground px-3 py-2 shadow-[3px_3px_0px_0px] shadow-foreground",
					isSelf
						? "bg-primary text-primary-foreground"
						: "bg-card text-card-foreground",
				)}
			>
				<p className="whitespace-pre-wrap break-words text-sm">{body}</p>
				<div
					className={cn(
						"mt-1 flex items-center gap-1 text-xs",
						isSelf ? "justify-end opacity-70" : "opacity-50",
					)}
				>
					<span>{formatRelativeTime(createdAt)}</span>
					{isSelf && status === "sending" && (
						<Loader2 className="size-3 animate-spin" />
					)}
					{isSelf && status === "sent" && <Check className="size-3" />}
					{isSelf && status === "error" && (
						<button
							type="button"
							onClick={onRetry}
							className="inline-flex items-center gap-0.5 text-destructive hover:underline"
							aria-label="Retry sending message"
						>
							<AlertCircle className="size-3" />
							<span>Retry</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
