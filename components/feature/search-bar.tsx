"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Search...",
	className,
}: SearchBarProps) {
	return (
		<div className={cn("relative", className)}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="peer h-13 w-full rounded-base border-2 border-border bg-card py-2 pr-9 pl-9 text-sm shadow-shadow transition-all outline-none placeholder:text-muted-foreground focus:brutal-press-focus"
			/>
			<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground z-10 peer-focus:translate-x-[2px] peer-focus:translate-y-[calc(-50%+2px)] transition-all duration-200" />
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10 peer-focus:translate-x-[2px] peer-focus:translate-y-[calc(-50%+2px)] transition-all duration-200"
					aria-label="Clear search"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);
}
