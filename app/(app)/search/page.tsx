"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { SearchBar } from "@/components/feature/search-bar";
import { UserResultItem } from "@/components/feature/user-result-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { FriendStatus } from "@/lib/types";

interface SearchUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
	friendStatus: FriendStatus;
}

export default function SearchPage() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [navigating, setNavigating] = useState<string | null>(null);

	useEffect(() => {
		async function loadUsers() {
			setIsLoading(true);
			try {
				const res = await fetch("/api/users/search?q=");
				if (res.ok) {
					const data = await res.json();
					const friends = (data.friends ?? data.following ?? []).map(
						(u: SearchUser) => ({
							...u,
							friendStatus: u.friendStatus ?? ("friends" as FriendStatus),
						}),
					);
					const others = (data.others ?? data.notFollowing ?? []).map(
						(u: SearchUser) => ({
							...u,
							friendStatus: u.friendStatus ?? ("none" as FriendStatus),
						}),
					);
					setAllUsers([...friends, ...others]);
				}
			} catch {
				// silently fail
			} finally {
				setIsLoading(false);
			}
		}
		loadUsers();
	}, []);

	const filtered = useMemo(() => {
		if (!query.trim()) return allUsers;
		const lowerQ = query.toLowerCase();
		return allUsers.filter(
			(u) =>
				(u.username ?? "").toLowerCase().includes(lowerQ) ||
				u.name.toLowerCase().includes(lowerQ),
		);
	}, [query, allUsers]);

	const friends = filtered.filter((u) => u.friendStatus === "friends");
	const pending = filtered.filter(
		(u) =>
			u.friendStatus === "pending_sent" ||
			u.friendStatus === "pending_received",
	);
	const others = filtered.filter((u) => u.friendStatus === "none");

	const handleUserClick = useCallback(
		async (userId: string) => {
			setNavigating(userId);
			try {
				const res = await fetch("/api/conversations", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ otherUserId: userId }),
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
				placeholder="Search by name..."
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

			{!isLoading && filtered.length === 0 && query.trim() && (
				<EmptyState
					icon={SearchIcon}
					title="No users found"
					description={`No users matching "${query}".`}
				/>
			)}

			{!isLoading &&
				(friends.length > 0 || pending.length > 0 || others.length > 0) && (
					<div className="space-y-6">
						{friends.length > 0 && (
							<section>
								<h2 className="mb-3 font-heading text-lg font-bold">Friends</h2>
								<div className="space-y-2">
									{friends.map((user) => (
										<UserResultItem
											key={user.id}
											username={user.username}
											name={user.name}
											image={user.image}
											friendStatus="friends"
											onClick={() => handleUserClick(user.id)}
											className={
												navigating === user.id ? "opacity-50" : undefined
											}
										/>
									))}
								</div>
							</section>
						)}

						{pending.length > 0 && (
							<section>
								<h2 className="mb-3 font-heading text-lg font-bold">Pending</h2>
								<div className="space-y-2">
									{pending.map((user) => (
										<UserResultItem
											key={user.id}
											username={user.username}
											name={user.name}
											image={user.image}
											friendStatus={user.friendStatus}
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
											friendStatus="none"
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
