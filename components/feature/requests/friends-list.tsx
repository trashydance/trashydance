import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendCard } from "./friend-card";
import type { FriendEntry } from "./types";

interface FriendsListProps {
	friends: FriendEntry[];
	onUnfriend: (id: string) => void;
	loadingId: string | null;
}

export function FriendsList({
	friends,
	onUnfriend,
	loadingId,
}: FriendsListProps) {
	if (friends.length === 0) return null;

	return (
		<section>
			<h2 className="mb-3 font-heading text-lg font-bold">Following</h2>
			<div className="space-y-2">
				{friends.map((entry) => (
					<FriendCard key={entry.id} user={entry.friend}>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onUnfriend(entry.id)}
							disabled={loadingId === entry.id}
						>
							<UserMinus className="size-4" />
							Unfollow
						</Button>
					</FriendCard>
				))}
			</div>
		</section>
	);
}
