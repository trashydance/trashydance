"use client";

import { Paperclip, Send, X } from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	ALLOWED_MIME_ACCEPT_STRING,
	ALLOWED_MIME_TYPES_SET,
	MAX_FILE_SIZE,
	MAX_MESSAGE_LENGTH,
	MESSAGE_LENGTH_WARNING_THRESHOLD,
	TEXTAREA_MAX_HEIGHT_PX,
} from "@/lib/constants";
import { cn, formatFileSize } from "@/lib/utils";

interface FileInfo {
	fileName: string;
	fileUrl: string;
	fileType: string;
	fileSize: number;
}

interface MessageInputProps {
	onSend: (body: string, fileInfo?: FileInfo) => void;
	conversationId: string;
	disabled?: boolean;
	className?: string;
}

export function MessageInput({
	onSend,
	conversationId,
	disabled,
	className,
}: MessageInputProps) {
	const [value, setValue] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [fileError, setFileError] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleInput = useCallback(() => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
		}
	}, []);

	const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setFileError(null);
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > MAX_FILE_SIZE) {
			setFileError("File size exceeds 10MB limit");
			return;
		}

		if (!ALLOWED_MIME_TYPES_SET.has(file.type)) {
			setFileError("File type not allowed");
			return;
		}

		setSelectedFile(file);
		// Reset the input so the same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const removeFile = useCallback(() => {
		setSelectedFile(null);
		setFileError(null);
	}, []);

	const handleSend = useCallback(async () => {
		const trimmed = value.trim();
		if (!trimmed && !selectedFile) return;
		if (trimmed.length > MAX_MESSAGE_LENGTH) return;
		if (isUploading) return;

		let fileInfo: FileInfo | undefined;

		if (selectedFile) {
			setIsUploading(true);
			try {
				const formData = new FormData();
				formData.append("file", selectedFile);
				formData.append("conversationId", conversationId);

				const res = await fetch("/api/uploads", {
					method: "POST",
					body: formData,
				});

				if (!res.ok) {
					const err = await res.json();
					setFileError(err.error || "Upload failed");
					setIsUploading(false);
					return;
				}

				fileInfo = await res.json();
			} catch {
				setFileError("Upload failed");
				setIsUploading(false);
				return;
			} finally {
				setIsUploading(false);
			}
		}

		onSend(trimmed, fileInfo);
		setValue("");
		setSelectedFile(null);
		setFileError(null);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [value, selectedFile, isUploading, conversationId, onSend]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	const charCount = value.length;
	const nearLimit =
		charCount > MAX_MESSAGE_LENGTH * MESSAGE_LENGTH_WARNING_THRESHOLD;
	const canSend =
		!isUploading && (value.trim().length > 0 || selectedFile !== null);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{selectedFile && (
				<div className="flex items-center gap-2 rounded-md border-4 border-border bg-muted px-3 py-2 text-sm">
					<Paperclip className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate flex-1">{selectedFile.name}</span>
					<span className="shrink-0 text-xs text-muted-foreground">
						{formatFileSize(selectedFile.size)}
					</span>
					<button
						type="button"
						onClick={removeFile}
						className="shrink-0 rounded-sm p-0.5 hover:bg-accent"
						aria-label="Remove file"
					>
						<X className="size-4" />
					</button>
				</div>
			)}
			{fileError && <p className="text-xs text-destructive">{fileError}</p>}
			<div className="flex items-end gap-2">
				<input
					ref={fileInputRef}
					type="file"
					accept={ALLOWED_MIME_ACCEPT_STRING}
					onChange={handleFileSelect}
					className="hidden"
					aria-label="Attach file"
				/>
				<Button
					size="icon"
					variant="outline"
					onClick={() => fileInputRef.current?.click()}
					disabled={disabled || isUploading}
					aria-label="Attach file"
					type="button"
				>
					<Paperclip className="size-4" />
				</Button>
				<div className="relative flex-1">
					<textarea
						ref={textareaRef}
						value={value}
						onChange={(e) =>
							setValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
						}
						onInput={handleInput}
						onKeyDown={handleKeyDown}
						placeholder="Write something..."
						disabled={disabled || isUploading}
						rows={1}
						className="w-full resize-none rounded-base border-4 border-border bg-card px-3 py-2 pr-16 text-sm shadow-brutal-sm transition-all outline-none placeholder:text-muted-foreground focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none disabled:opacity-50"
					/>
					<span
						className={cn(
							"pointer-events-none absolute right-3 bottom-2.5 text-[10px] font-bold uppercase tracking-wider",
							charCount >= MAX_MESSAGE_LENGTH
								? "text-destructive"
								: nearLimit
									? "text-accent"
									: "text-muted-foreground",
						)}
					>
						{charCount}/{MAX_MESSAGE_LENGTH}
					</span>
				</div>
				<Button
					size="icon"
					onClick={handleSend}
					disabled={disabled || !canSend}
					aria-label="Send message"
				>
					<Send className="size-4" />
				</Button>
			</div>
		</div>
	);
}
