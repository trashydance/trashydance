interface SectionHeaderProps {
	title: string;
	count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
	return (
		<div className="mb-4 flex items-center gap-3">
			<h2 className="font-heading text-xl">{title}</h2>
			{count !== undefined && (
				<span className="flex h-[26px] min-w-[26px] shrink-0 items-center justify-center bg-foreground px-1.5 text-sm font-bold text-background">
					{count}
				</span>
			)}
			<div className="h-0.5 flex-1 bg-foreground" />
		</div>
	);
}
