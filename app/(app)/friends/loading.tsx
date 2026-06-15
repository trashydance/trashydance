import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-8 w-48" />
			{Array.from({ length: 4 }).map((_, i) => (
				<Skeleton key={`req-skel-${i.toString()}`} className="h-16 w-full" />
			))}
		</div>
	);
}
