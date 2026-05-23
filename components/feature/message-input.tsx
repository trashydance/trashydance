"use client";

import { Send } from "lucide-react";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;

interface MessageInputProps {
	onSend: (body: string) => void;
	disabled?: boolean;
	className?: string;
}

export function MessageInput({
	onSend,
	disabled,
	className,
}: MessageInputProps) {
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleInput = useCallback(() => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
		}
	}, []);

	const handleSend = useCallback(() => {
		const trimmed = value.trim();
		if (!trimmed || trimmed.length > MAX_LENGTH) return;
		onSend(trimmed);
		setValue("");
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [value, onSend]);

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
	const nearLimit = charCount > MAX_LENGTH * 0.9;

	return (
		<div className={cn("flex items-end gap-2", className)}>
			<div className="relative flex-1">
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					disabled={disabled}
					rows={1}
					className="w-full resize-none rounded-md border-2 border-foreground bg-transparent px-3 py-2 text-sm shadow-[4px_4px_0px_0px] shadow-foreground transition-all outline-none placeholder:text-muted-foreground focus:shadow-[2px_2px_0px_0px] focus:shadow-foreground focus:translate-x-[2px] focus:translate-y-[2px] disabled:opacity-50"
				/>
				{nearLimit && (
					<span
						className={cn(
							"absolute right-2 bottom-1 text-xs",
							charCount >= MAX_LENGTH
								? "text-destructive"
								: "text-muted-foreground",
						)}
					>
						{charCount}/{MAX_LENGTH}
					</span>
				)}
			</div>
			<Button
				size="icon"
				onClick={handleSend}
				disabled={disabled || !value.trim()}
				aria-label="Send message"
			>
				<Send className="size-4" />
			</Button>
		</div>
	);
}
