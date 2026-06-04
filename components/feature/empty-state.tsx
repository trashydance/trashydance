import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionHref,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-4 rounded-lg border-4 border-dashed border-border/30 p-8 text-center",
				className,
			)}
		>
			<div className="rounded-md border-4 border-border bg-muted p-3 shadow-shadow">
				<Icon className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<h3 className="font-heading text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			{actionLabel && actionHref && (
				<Button asChild>
					<Link href={actionHref}>{actionLabel}</Link>
				</Button>
			)}
		</div>
	);
}
