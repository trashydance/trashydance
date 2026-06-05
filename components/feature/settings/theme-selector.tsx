"use client";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const THEMES = ["light", "dark", "system"] as const;

export function ThemeSelector() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex items-center justify-between gap-4 rounded-base border-4 border-border bg-card p-4 shadow-shadow">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide">Theme</p>
				<p className="text-sm text-muted-foreground">
					Match system or pick a side.
				</p>
			</div>
			<div className="flex border-2 border-border p-1">
				{THEMES.map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTheme(t)}
						className={cn(
							"px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
							theme === t
								? "border-2 border-border bg-main text-main-foreground"
								: "text-foreground hover:bg-muted",
						)}
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
}
