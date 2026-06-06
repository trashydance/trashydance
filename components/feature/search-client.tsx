"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { FriendRequestButton } from "@/components/feature/friend-request-button";
import { SearchBar } from "@/components/feature/search-bar";
import { UserResultItem } from "@/components/feature/user-result-item";
import type { FriendStatus, SearchUser } from "@/lib/types";

interface SearchClientProps {
	initialUsers: SearchUser[];
}

export function SearchClient({ initialUsers }: SearchClientProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [allUsers, setAllUsers] = useState<SearchUser[]>(initialUsers);
	const [navigating, setNavigating] = useState<string | null>(null);

	// Re-sync when the server component re-renders with fresh data.
	useEffect(() => {
		setAllUsers(initialUsers);
	}, [initialUsers]);

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

	const handleStatusChange = useCallback(
		(userId: string, newStatus: FriendStatus) => {
			setAllUsers((prev) =>
				prev.map((u) =>
					u.id === userId ? { ...u, friendStatus: newStatus } : u,
				),
			);
		},
		[],
	);

	return (
		<>
			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder="Search by username or name..."
			/>

			{filtered.length === 0 && query.trim() && (
				<EmptyState
					icon={SearchIcon}
					title="No users found"
					description={`No users matching "${query}".`}
				/>
			)}

			{(friends.length > 0 || pending.length > 0 || others.length > 0) && (
				<div className="space-y-6">
					{friends.length > 0 && (
						<section>
							<h2 className="mb-3 font-heading text-lg font-bold">Following</h2>
							<div className="space-y-2">
								{friends.map((user) => (
									<UserResultItem
										key={user.id}
										username={user.username}
										name={user.name}
										image={user.image}
										onClick={() => handleUserClick(user.id)}
										className={
											navigating === user.id ? "opacity-50" : undefined
										}
										actions={
											<FriendRequestButton
												userId={user.id}
												initialStatus={user.friendStatus}
												requestId={user.friendRequestId ?? undefined}
												onStatusChange={(s) => handleStatusChange(user.id, s)}
											/>
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
										onClick={() => handleUserClick(user.id)}
										className={
											navigating === user.id ? "opacity-50" : undefined
										}
										actions={
											<FriendRequestButton
												userId={user.id}
												initialStatus={user.friendStatus}
												requestId={user.friendRequestId ?? undefined}
												onStatusChange={(s) => handleStatusChange(user.id, s)}
											/>
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
										onClick={() => handleUserClick(user.id)}
										className={
											navigating === user.id ? "opacity-50" : undefined
										}
										actions={
											<FriendRequestButton
												userId={user.id}
												initialStatus={user.friendStatus}
												requestId={user.friendRequestId ?? undefined}
												onStatusChange={(s) => handleStatusChange(user.id, s)}
											/>
										}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</>
	);
}
