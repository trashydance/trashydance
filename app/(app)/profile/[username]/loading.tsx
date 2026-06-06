import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col items-center gap-6 py-8">
			<Skeleton className="size-24 rounded-full" />
			<Skeleton className="h-8 w-40" />
			<Skeleton className="h-4 w-60" />
			<div className="flex gap-8">
				<Skeleton className="h-12 w-20" />
			</div>
		</div>
	);
}
