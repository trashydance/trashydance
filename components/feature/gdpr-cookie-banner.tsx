"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

export function GDPRCookieBanner() {
	const [accepted, setAccepted] = useState(true);
	const { t } = useI18n();

	useEffect(() => {
		const consent = localStorage.getItem("gdpr-cookie-consent");
		if (!consent) {
			setAccepted(false);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem("gdpr-cookie-consent", "true");
		setAccepted(true);
	};

	if (accepted) return null;

	return (
		<div className="fixed bottom-5 left-5 right-5 z-50 max-w-sm rounded-base border-4 border-border bg-card p-5 shadow-shadow md:left-auto md:right-5 animate-in slide-in-from-bottom duration-300">
			<h3 className="font-heading text-base font-bold uppercase tracking-wide">
				🍪 {t("cookieTitle")}
			</h3>
			<p className="mt-2 text-xs text-muted-foreground leading-relaxed">
				{t("cookieDesc")}
			</p>
			<div className="mt-4 flex justify-end">
				<Button size="sm" onClick={handleAccept}>
					{t("cookieGotIt")}
				</Button>
			</div>
		</div>
	);
}
