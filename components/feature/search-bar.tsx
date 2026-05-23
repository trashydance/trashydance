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
			<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-10 w-full rounded-md border-2 border-foreground bg-transparent py-2 pr-9 pl-9 text-sm shadow-[4px_4px_0px_0px] shadow-foreground transition-all outline-none placeholder:text-muted-foreground focus:shadow-[2px_2px_0px_0px] focus:shadow-foreground focus:translate-x-[2px] focus:translate-y-[2px]"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);
}
