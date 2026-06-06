import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton key={`skel-${i.toString()}`} className="h-16 w-full" />
			))}
		</div>
	);
}
