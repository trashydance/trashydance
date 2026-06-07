import { SettingsClient } from "@/components/feature/settings/settings-client";
import { requireUser } from "@/lib/data/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
	const me = await requireUser();
	const twoFactorEnabled = me.twoFactorEnabled ?? false;

	return <SettingsClient twoFactorEnabled={twoFactorEnabled} />;
}
