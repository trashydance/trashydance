import type { Metadata } from "next";
import { FriendRequestsClient } from "@/components/feature/requests/friend-requests-client";
import { getFriendRequestsData } from "@/lib/data/friends";
import { requireUser } from "@/lib/data/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Friends",
};

export default async function FriendsPage() {
	const me = await requireUser();
	const data = await getFriendRequestsData(me.id);

	return (
		<div className="space-y-8">
			<FriendRequestsClient initialData={data} />
		</div>
	);
}
