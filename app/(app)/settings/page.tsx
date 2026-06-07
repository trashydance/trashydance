"use client";

import { SectionHeader } from "@/components/feature/section-header";
import { ChangePasswordForm } from "@/components/feature/settings/change-password-form";
import { DeleteAccountSection } from "@/components/feature/settings/delete-account-section";
import { ProfileForm } from "@/components/feature/settings/profile-form";
import { TwoFactorSetup } from "@/components/feature/settings/two-factor-setup";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
	const { data: session } = authClient.useSession();
	const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

	return (
		<div className="flex flex-col gap-8">
			<h1 className="font-heading text-5xl">Settings.</h1>

			<section>
				<SectionHeader title="Security" />
				<div className="flex flex-col gap-4">
					<TwoFactorSetup twoFactorEnabled={twoFactorEnabled} />
					<ChangePasswordForm />
				</div>
			</section>

			<section>
				<SectionHeader title="Account" />
				<ProfileForm />
				<DeleteAccountSection />
			</section>
		</div>
	);
}
