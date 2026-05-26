import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FriendRequestUser } from "./types";

interface FriendCardProps {
	user: FriendRequestUser;
	children: React.ReactNode;
}

export function FriendCard({ user, children }: FriendCardProps) {
	const displayName = user.username || user.name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<div className="flex items-center gap-3 rounded-md border-2 border-border bg-background p-3 shadow-[4px_4px_0px_0px] shadow-border">
			<Avatar>
				{user.image && <AvatarImage src={user.image} alt={displayName} />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<span className="font-heading text-sm font-semibold">
					{displayName}
				</span>
				{user.name !== displayName && (
					<p className="truncate text-xs text-muted-foreground">{user.name}</p>
				)}
			</div>
			<div className="flex gap-2">{children}</div>
		</div>
	);
}
