"use client";

import { authClient } from "@/lib/auth-client";

export default function Header() {
	const { data } = authClient.useSession();

	async function signOut() {
		await authClient.signOut();
	}

	return (
		<header>
			Hi {data?.user.name}!{" "}
			<button type="button" onClick={signOut}>
				Sign out
			</button>
		</header>
	);
}
