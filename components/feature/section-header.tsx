interface SectionHeaderProps {
	title: string;
	count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
	return (
		<div className="mb-4 flex items-center gap-3">
			<h2 className="font-heading text-xl">{title}</h2>
			{count !== undefined && (
				<span className="flex size-6 shrink-0 items-center justify-center bg-foreground text-xs font-bold text-background">
					{count}
				</span>
			)}
			<div className="h-0.5 flex-1 bg-foreground" />
		</div>
	);
}
