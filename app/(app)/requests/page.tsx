"use client";

import { Check, Clock, UserMinus, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/use-socket";

interface FriendRequestUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
}

interface ReceivedRequest {
	id: string;
	sender: FriendRequestUser;
	status: string;
	createdAt: string;
}

interface SentRequest {
	id: string;
	receiver: FriendRequestUser;
	status: string;
	createdAt: string;
}

interface FriendEntry {
	id: string;
	friend: FriendRequestUser;
	createdAt: string;
}

interface FriendRequestsData {
	received: ReceivedRequest[];
	sent: SentRequest[];
	accepted: FriendEntry[];
}

export default function RequestsPage() {
	const [data, setData] = useState<FriendRequestsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	const fetchRequests = useCallback(async () => {
		try {
			const res = await fetch("/api/friend-requests");
			if (res.ok) {
				const json = await res.json();
				setData(json);
			}
		} catch {
			// Silently fail
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

	const { socket } = useSocket();

	useEffect(() => {
		if (!socket) return;

		function onUpdate() {
			fetchRequests();
		}

		socket.on("friend-request:new", onUpdate);
		socket.on("friend-request:update", onUpdate);
		socket.on("notification:count", onUpdate);

		return () => {
			socket.off("friend-request:new", onUpdate);
			socket.off("friend-request:update", onUpdate);
			socket.off("notification:count", onUpdate);
		};
	}, [socket, fetchRequests]);

	const handleAccept = useCallback(
		async (requestId: string) => {
			setActionLoading(requestId);
			try {
				const res = await fetch(`/api/friend-requests/${requestId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "accept" }),
				});
				if (res.ok) {
					fetchRequests();
				}
			} catch {
				// Silently fail
			} finally {
				setActionLoading(null);
			}
		},
		[fetchRequests],
	);

	const handleReject = useCallback(
		async (requestId: string) => {
			setActionLoading(requestId);
			try {
				const res = await fetch(`/api/friend-requests/${requestId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "reject" }),
				});
				if (res.ok) {
					fetchRequests();
				}
			} catch {
				// Silently fail
			} finally {
				setActionLoading(null);
			}
		},
		[fetchRequests],
	);

	const handleCancel = useCallback(
		async (requestId: string) => {
			setActionLoading(requestId);
			try {
				const res = await fetch(`/api/friend-requests/${requestId}`, {
					method: "DELETE",
				});
				if (res.ok) {
					fetchRequests();
				}
			} catch {
				// Silently fail
			} finally {
				setActionLoading(null);
			}
		},
		[fetchRequests],
	);

	const handleUnfriend = useCallback(
		async (requestId: string) => {
			setActionLoading(requestId);
			try {
				const res = await fetch(`/api/friend-requests/${requestId}`, {
					method: "DELETE",
				});
				if (res.ok) {
					fetchRequests();
				}
			} catch {
				// Silently fail
			} finally {
				setActionLoading(null);
			}
		},
		[fetchRequests],
	);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={`req-skel-${i.toString()}`} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!data) {
		return (
			<EmptyState
				icon={Users}
				title="Could not load requests"
				description="Something went wrong. Please try again later."
			/>
		);
	}

	const isEmpty =
		data.received.length === 0 &&
		data.sent.length === 0 &&
		data.accepted.length === 0;

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-heading text-2xl font-bold">Friend Requests</h1>
				<p className="text-sm text-muted-foreground">
					Manage your friend requests and connections.
				</p>
			</div>

			{isEmpty && (
				<EmptyState
					icon={Users}
					title="No requests yet"
					description="When someone sends you a friend request, it will show up here."
				/>
			)}

			{data.received.length > 0 && (
				<section>
					<h2 className="mb-3 font-heading text-lg font-bold">Received</h2>
					<div className="space-y-2">
						{data.received.map((req) => {
							const displayName = req.sender.username || req.sender.name;
							const initials = displayName.slice(0, 2).toUpperCase();
							const loading = actionLoading === req.id;

							return (
								<div
									key={req.id}
									className="flex items-center gap-3 rounded-md border-2 border-foreground bg-card p-3 shadow-[4px_4px_0px_0px] shadow-foreground"
								>
									<Avatar>
										{req.sender.image && (
											<AvatarImage src={req.sender.image} alt={displayName} />
										)}
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<span className="font-heading text-sm font-semibold">
											{displayName}
										</span>
										{req.sender.name !== displayName && (
											<p className="truncate text-xs text-muted-foreground">
												{req.sender.name}
											</p>
										)}
									</div>
									<div className="flex gap-2">
										<Button
											variant="default"
											size="sm"
											onClick={() => handleAccept(req.id)}
											disabled={loading}
										>
											<Check className="size-4" />
											Accept
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleReject(req.id)}
											disabled={loading}
										>
											<X className="size-4" />
											Reject
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{data.sent.length > 0 && (
				<section>
					<h2 className="mb-3 font-heading text-lg font-bold">Sent</h2>
					<div className="space-y-2">
						{data.sent.map((req) => {
							const displayName = req.receiver.username || req.receiver.name;
							const initials = displayName.slice(0, 2).toUpperCase();
							const loading = actionLoading === req.id;

							return (
								<div
									key={req.id}
									className="flex items-center gap-3 rounded-md border-2 border-foreground bg-card p-3 shadow-[4px_4px_0px_0px] shadow-foreground"
								>
									<Avatar>
										{req.receiver.image && (
											<AvatarImage src={req.receiver.image} alt={displayName} />
										)}
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<span className="font-heading text-sm font-semibold">
											{displayName}
										</span>
										{req.receiver.name !== displayName && (
											<p className="truncate text-xs text-muted-foreground">
												{req.receiver.name}
											</p>
										)}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleCancel(req.id)}
										disabled={loading}
									>
										<Clock className="size-4" />
										Cancel
									</Button>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{data.accepted.length > 0 && (
				<section>
					<h2 className="mb-3 font-heading text-lg font-bold">Friends</h2>
					<div className="space-y-2">
						{data.accepted.map((entry) => {
							const displayName = entry.friend.username || entry.friend.name;
							const initials = displayName.slice(0, 2).toUpperCase();
							const loading = actionLoading === entry.id;

							return (
								<div
									key={entry.id}
									className="flex items-center gap-3 rounded-md border-2 border-foreground bg-card p-3 shadow-[4px_4px_0px_0px] shadow-foreground"
								>
									<Avatar>
										{entry.friend.image && (
											<AvatarImage src={entry.friend.image} alt={displayName} />
										)}
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<span className="font-heading text-sm font-semibold">
											{displayName}
										</span>
										{entry.friend.name !== displayName && (
											<p className="truncate text-xs text-muted-foreground">
												{entry.friend.name}
											</p>
										)}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleUnfriend(entry.id)}
										disabled={loading}
									>
										<UserMinus className="size-4" />
										Unfriend
									</Button>
								</div>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
}
