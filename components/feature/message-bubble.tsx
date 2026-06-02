"use client";

import {
	AlertCircle,
	Check,
	FileDown,
	FileSpreadsheet,
	FileText,
	ImageIcon,
	Loader2,
	Presentation,
	Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn, formatFileSize, formatRelativeTime } from "@/lib/utils";

interface MessageBubbleProps {
	body: string;
	createdAt: string;
	isSelf: boolean;
	status?: "sending" | "sent" | "error";
	onRetry?: () => void;
	fileName?: string;
	fileUrl?: string;
	fileType?: string;
	fileSize?: number;
}

function getFileIcon(mimeType: string) {
	if (mimeType.startsWith("image/")) return ImageIcon;
	if (mimeType.startsWith("video/")) return Video;
	if (mimeType === "application/pdf") return FileText;
	if (
		mimeType === "application/msword" ||
		mimeType ===
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	)
		return FileText;
	if (
		mimeType === "application/vnd.ms-excel" ||
		mimeType ===
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	)
		return FileSpreadsheet;
	if (
		mimeType === "application/vnd.ms-powerpoint" ||
		mimeType ===
			"application/vnd.openxmlformats-officedocument.presentationml.presentation"
	)
		return Presentation;
	return FileDown;
}

function FilePreview({
	fileName,
	fileUrl,
	fileType,
	fileSize,
	isSelf,
}: {
	fileName: string;
	fileUrl: string;
	fileType: string;
	fileSize: number;
	isSelf: boolean;
}) {
	const [fullView, setFullView] = useState(false);

	// Image preview
	if (fileType.startsWith("image/")) {
		return (
			<div className="mb-1">
				<button
					type="button"
					onClick={() => setFullView(!fullView)}
					className="block cursor-pointer"
				>
					<Image
						src={fileUrl}
						alt={fileName}
						width={240}
						height={180}
						className={cn(
							"rounded-md border border-border/20",
							fullView
								? "w-auto h-auto max-w-full"
								: "max-w-[240px] max-h-[180px]",
						)}
						style={{ objectFit: "cover" }}
					/>
				</button>

				{fullView && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
						<button
							type="button"
							onClick={() => setFullView(false)}
							className="absolute inset-0"
							aria-label="Close full size image"
						/>
						<Image
							src={fileUrl}
							alt={fileName}
							width={1200}
							height={900}
							className="relative z-10 max-h-[90vh] max-w-[90vw] rounded-md"
							style={{ objectFit: "contain" }}
						/>
					</div>
				)}
			</div>
		);
	}

	// Video preview
	if (fileType.startsWith("video/")) {
		return (
			<div className="mb-1">
				{/* biome-ignore lint/a11y/useMediaCaption: user-uploaded video content */}
				<video
					src={fileUrl}
					controls
					className="max-w-[280px] max-h-[200px] rounded-md border border-border/20"
					preload="metadata"
				/>
			</div>
		);
	}

	// Document download link
	const Icon = getFileIcon(fileType);

	return (
		<a
			href={fileUrl}
			download={fileName}
			className={cn(
				"mb-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm no-underline transition-colors hover:bg-accent/50",
				isSelf ? "border-primary-foreground/30" : "border-border/20",
			)}
		>
			<Icon className="size-5 shrink-0" />
			<div className="flex-1 truncate">
				<div className="truncate font-medium">{fileName}</div>
				<div className="text-xs opacity-70">{formatFileSize(fileSize)}</div>
			</div>
			<FileDown className="size-4 shrink-0 opacity-50" />
		</a>
	);
}

export function MessageBubble({
	body,
	createdAt,
	isSelf,
	status,
	onRetry,
	fileName,
	fileUrl,
	fileType,
	fileSize,
}: MessageBubbleProps) {
	const hasFile = fileName && fileUrl && fileType && fileSize;

	return (
		<div
			className={cn("flex w-full", isSelf ? "justify-end" : "justify-start")}
		>
			<div
				className={cn(
					"max-w-[75%] rounded-lg border-2 border-border px-3 py-2 shadow-[3px_3px_0px_0px] shadow-border",
					isSelf
						? "bg-primary text-primary-foreground"
						: "bg-background text-foreground",
				)}
			>
				{hasFile && (
					<FilePreview
						fileName={fileName}
						fileUrl={fileUrl}
						fileType={fileType}
						fileSize={fileSize}
						isSelf={isSelf}
					/>
				)}

				{body && (
					<p className="whitespace-pre-wrap break-words text-sm">{body}</p>
				)}

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
