import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md border-4 border-border px-2.5 py-0.5 text-xs font-semibold transition-colors",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-[2px_2px_0px_0px] shadow-border",
				secondary:
					"bg-secondary text-secondary-foreground shadow-[2px_2px_0px_0px] shadow-border",
				destructive:
					"bg-destructive text-white shadow-[2px_2px_0px_0px] shadow-border",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
	return (
		<div
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
