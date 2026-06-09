"use client";

import { SectionHeader } from "@/components/feature/section-header";
import type { User } from "@/lib/types";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountSection } from "./delete-account-section";
import { ProfileForm } from "./profile-form";
import { TwoFactorSetup } from "./two-factor-setup";

interface SettingsClientProps {
	twoFactorEnabled: boolean;
	user: User;
}

export function SettingsClient({ twoFactorEnabled, user }: SettingsClientProps) {
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
				<ProfileForm initialUser={user} />
				<DeleteAccountSection />
			</section>
		</div>
	);
}
