import { FriendRequestsClient } from "@/components/feature/requests/friend-requests-client";
import { getFriendRequestsData } from "@/lib/data/friends";
import { requireUser } from "@/lib/data/session";

export default async function FriendsPage() {
	const me = await requireUser();
	const data = await getFriendRequestsData(me.id);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-heading text-2xl font-bold">Friends</h1>
				<p className="text-sm text-muted-foreground">
					Manage your follow requests and connections.
				</p>
			</div>

			<FriendRequestsClient initialData={data} />
		</div>
	);
}
