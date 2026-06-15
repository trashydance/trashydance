import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-10 w-full" />
			<div className="space-y-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton
						key={`search-skel-${i.toString()}`}
						className="h-14 w-full"
					/>
				))}
			</div>
		</div>
	);
}
