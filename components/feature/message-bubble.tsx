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
import { cn, formatFileSize, getAvatarColor, getInitials } from "@/lib/utils";

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
	partnerName?: string;
	partnerImage?: string | null;
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
}: {
	fileName: string;
	fileUrl: string;
	fileType: string;
	fileSize: number;
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
							"rounded-base border-2 border-border",
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
			className="mb-1 flex items-center gap-3 rounded-base border-2 border-border bg-card px-3 py-2 text-sm text-foreground no-underline shadow-brutal-sm transition-all hover:brutal-press-hover"
		>
			<span className="flex size-9 shrink-0 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
				<Icon className="size-4" />
			</span>
			<div className="flex-1 truncate">
				<div className="truncate text-xs font-bold uppercase tracking-wide">
					{fileName}
				</div>
				<div className="text-xs text-muted-foreground">
					{formatFileSize(fileSize)}
				</div>
			</div>
			<FileDown className="size-4 shrink-0 opacity-50" />
		</a>
	);
}

export function MessageBubble({
	body,
	createdAt: _createdAt,
	isSelf,
	status,
	onRetry,
	fileName,
	fileUrl,
	fileType,
	fileSize,
	partnerName,
	partnerImage,
}: MessageBubbleProps) {
	const hasFile = fileName && fileUrl && fileType && fileSize;
	const partnerInitials = getInitials(partnerName ?? "??");

	return (
		<div
			className={cn(
				"flex w-full flex-col",
				isSelf ? "items-end" : "items-start",
			)}
		>
			<div className={cn("flex max-w-[75%] items-start gap-2")}>
				{!isSelf && (
					<span
						className="mt-0.5 flex size-7 shrink-0 items-center justify-center overflow-hidden border-2 border-border text-[9px] font-bold uppercase text-ink"
						style={
							partnerImage
								? undefined
								: { backgroundColor: getAvatarColor(partnerName ?? "??") }
						}
					>
						{partnerImage ? (
							// biome-ignore lint/performance/noImgElement: avatar minuscolo già ottimizzato altrove
							<img
								src={partnerImage}
								alt={partnerName ?? ""}
								className="size-full object-cover"
							/>
						) : (
							partnerInitials
						)}
					</span>
				)}
				<div
					className={cn(
						"min-w-0 rounded-base border-2 border-border px-4 py-2.5 shadow-brutal-sm",
						isSelf ? "bg-main text-main-foreground" : "bg-card text-foreground",
					)}
				>
					{hasFile && (
						<FilePreview
							fileName={fileName}
							fileUrl={fileUrl}
							fileType={fileType}
							fileSize={fileSize}
						/>
					)}

					{body && (
						<p className="whitespace-pre-wrap break-words text-sm">{body}</p>
					)}
				</div>
			</div>

			{isSelf && (
				<div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
					{status === "sending" && <Loader2 className="size-3 animate-spin" />}

					{status === "sent" && (
						<>
							<Check className="size-3" />
							<span>Sent</span>
						</>
					)}

					{status === "error" && (
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
			)}
		</div>
	);
}
