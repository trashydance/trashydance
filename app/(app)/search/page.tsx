import { SearchClient } from "@/components/feature/search-client";
import { requireUser } from "@/lib/data/session";
import { getInitialUserList } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
	const me = await requireUser();
	const { friends, others } = await getInitialUserList(me.id);

	return (
		<div className="space-y-6">
			<h1 className="font-heading text-5xl">Find people.</h1>

			<SearchClient initialUsers={[...friends, ...others]} />
		</div>
	);
}
