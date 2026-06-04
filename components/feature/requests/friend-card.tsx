import { UserAvatar } from "@/components/feature/user-avatar";
import type { FriendRequestUser } from "./types";

interface FriendCardProps {
	user: FriendRequestUser;
	subtitle?: string;
	children: React.ReactNode;
}

export function FriendCard({ user, subtitle, children }: FriendCardProps) {
	const displayName = user.username || user.name;

	return (
		<div className="flex items-center gap-4 rounded-base border-4 border-border bg-card p-4 shadow-shadow transition-all hover:brutal-press-hover">
			<UserAvatar name={displayName} image={user.image} />
			<div className="min-w-0 flex-1">
				<span className="block truncate text-sm font-bold uppercase tracking-wide">
					{user.name !== displayName ? user.name : displayName}
				</span>
				<p className="truncate text-xs text-muted-foreground">
					{user.username ? `@${user.username}` : user.name}
					{subtitle ? ` · ${subtitle}` : ""}
				</p>
			</div>
			<div className="flex gap-2">{children}</div>
		</div>
	);
}
