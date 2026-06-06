import { SearchClient } from "@/components/feature/search-client";
import { requireUser } from "@/lib/data/session";
import { getInitialUserList } from "@/lib/data/users";

export default async function SearchPage() {
	const me = await requireUser();
	const { friends, others } = await getInitialUserList(me.id);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="mb-2 font-heading text-2xl font-bold">Search Users</h1>
				<p className="text-sm text-muted-foreground">
					Find someone to chat with.
				</p>
			</div>

			<SearchClient initialUsers={[...friends, ...others]} />
		</div>
	);
}
