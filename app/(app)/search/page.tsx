"use client";

import { Search as SearchIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { SearchBar } from "@/components/feature/search-bar";
import { UserResultItem } from "@/components/feature/user-result-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/use-search";

export default function SearchPage() {
	const { query, setQuery, results, isLoading } = useSearch();
	const router = useRouter();
	const [navigating, setNavigating] = useState<string | null>(null);

	const handleUserClick = useCallback(
		async (userId: string) => {
			setNavigating(userId);
			try {
				// Try to find existing conversation or create a new one
				const res = await fetch("/api/conversations", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ partnerId: userId }),
				});

				if (res.ok) {
					const data = await res.json();
					router.push(`/chat/${data.id}`);
				}
			} catch {
				setNavigating(null);
			}
		},
		[router],
	);

	const following = results.filter((u) => u.isFollowing);
	const others = results.filter((u) => !u.isFollowing);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="mb-2 font-heading text-2xl font-bold">Search Users</h1>
				<p className="text-sm text-muted-foreground">
					Find someone to chat with.
				</p>
			</div>

			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder="Search by username..."
			/>

			{isLoading && (
				<div className="space-y-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={`search-skel-${i.toString()}`}
							className="h-14 w-full"
						/>
					))}
				</div>
			)}

			{!isLoading && query.trim() && results.length === 0 && (
				<EmptyState
					icon={SearchIcon}
					title="No users found"
					description={`No users matching "${query}".`}
				/>
			)}

			{!isLoading && !query.trim() && (
				<EmptyState
					icon={Users}
					title="Search for users"
					description="Type a username to find people to chat with."
				/>
			)}

			{!isLoading && results.length > 0 && (
				<div className="space-y-6">
					{following.length > 0 && (
						<section>
							<h2 className="mb-3 font-heading text-lg font-bold">Following</h2>
							<div className="space-y-2">
								{following.map((user) => (
									<UserResultItem
										key={user.id}
										username={user.username}
										name={user.name}
										image={user.image}
										isFollowing
										onClick={() => handleUserClick(user.id)}
										className={
											navigating === user.id ? "opacity-50" : undefined
										}
									/>
								))}
							</div>
						</section>
					)}

					{others.length > 0 && (
						<section>
							<h2 className="mb-3 font-heading text-lg font-bold">Others</h2>
							<div className="space-y-2">
								{others.map((user) => (
									<UserResultItem
										key={user.id}
										username={user.username}
										name={user.name}
										image={user.image}
										isFollowing={false}
										onClick={() => handleUserClick(user.id)}
										className={
											navigating === user.id ? "opacity-50" : undefined
										}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</div>
	);
}
