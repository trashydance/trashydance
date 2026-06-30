"use client";

import { SectionHeader } from "@/components/feature/section-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { User } from "@/lib/types";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountSection } from "./delete-account-section";
import { ExportDataSection } from "./export-data-section";
import { ProfileForm } from "./profile-form";
import { TwoFactorSetup } from "./two-factor-setup";

interface SettingsClientProps {
	twoFactorEnabled: boolean;
	user: User;
}

export function SettingsClient({
	twoFactorEnabled,
	user,
}: SettingsClientProps) {
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-8">
			<h1 className="font-heading text-5xl">{t("settings")}</h1>

			<section>
				<SectionHeader title={t("security")} />
				<div className="flex flex-col gap-4">
					<TwoFactorSetup twoFactorEnabled={twoFactorEnabled} />
					<ChangePasswordForm />
				</div>
			</section>

			<section>
				<SectionHeader title={t("account")} />
				<ProfileForm initialUser={user} />
				<ExportDataSection />
				<DeleteAccountSection />
			</section>
		</div>
	);
}
