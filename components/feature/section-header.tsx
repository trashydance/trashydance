import { CountBadge } from "./count-badge";

interface SectionHeaderProps {
	title: string;
	count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
	return (
		<div className="mb-4 flex items-center gap-3">
			<h2 className="font-heading text-xl">{title}</h2>
			{count !== undefined && <CountBadge>{count}</CountBadge>}
			<div className="h-0.5 flex-1 bg-foreground" />
		</div>
	);
}
