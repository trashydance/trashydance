"use client";

import { SectionHeader } from "@/components/feature/section-header";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountSection } from "./delete-account-section";
import { ProfileForm } from "./profile-form";
import { TwoFactorSetup } from "./two-factor-setup";

interface SettingsClientProps {
	twoFactorEnabled: boolean;
}

export function SettingsClient({ twoFactorEnabled }: SettingsClientProps) {
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
