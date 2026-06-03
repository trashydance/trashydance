"use client";

import { TwoFactorSetup } from "@/components/feature/settings/two-factor-setup";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
	const { data: session } = authClient.useSession();
	const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

	return (
		<div className="flex flex-col gap-6 py-4">
			<h1 className="font-heading text-2xl font-bold">Settings</h1>
			<TwoFactorSetup twoFactorEnabled={twoFactorEnabled} />
		</div>
	);
}
