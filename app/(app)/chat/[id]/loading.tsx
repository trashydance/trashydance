import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="flex h-[calc(100svh-8rem)] flex-col gap-4 p-4">
			<Skeleton className="h-14 w-full" />
			<div className="flex-1 space-y-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton
						key={`msg-skel-${i.toString()}`}
						className={`h-12 ${i % 2 === 0 ? "ml-auto w-2/3" : "w-2/3"}`}
					/>
				))}
			</div>
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
