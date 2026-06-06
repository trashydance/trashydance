import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const countBadgeVariants = cva(
	"inline-flex h-[26px] min-w-[26px] items-center justify-center px-1.5 text-sm font-bold",
	{
		variants: {
			variant: {
				neutral: "shrink-0 bg-foreground text-background",
				accent:
					"rounded-none border-2 border-border bg-accent text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "neutral",
		},
	},
);

interface CountBadgeProps extends VariantProps<typeof countBadgeVariants> {
	children: ReactNode;
	className?: string;
}

export function CountBadge({ variant, className, children }: CountBadgeProps) {
	return (
		<span className={cn(countBadgeVariants({ variant }), className)}>
			{children}
		</span>
	);
}
