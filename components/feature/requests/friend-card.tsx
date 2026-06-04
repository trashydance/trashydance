import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor } from "@/lib/utils";
import type { FriendRequestUser } from "./types";

interface FriendCardProps {
	user: FriendRequestUser;
	subtitle?: string;
	children: React.ReactNode;
}

export function FriendCard({ user, subtitle, children }: FriendCardProps) {
	const displayName = user.username || user.name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<div className="flex items-center gap-4 rounded-base border-4 border-border bg-card p-4 shadow-shadow transition-all hover:brutal-press-hover">
			<Avatar>
				{user.image && <AvatarImage src={user.image} alt={displayName} />}
				<AvatarFallback
					style={{ backgroundColor: getAvatarColor(displayName) }}
				>
					{initials}
				</AvatarFallback>
			</Avatar>
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
