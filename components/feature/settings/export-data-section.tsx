"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { exportUserData } from "@/lib/actions/profile";
import { useI18n } from "@/lib/i18n/i18n-context";

export function ExportDataSection() {
	const [exporting, setExporting] = useState(false);
	const { toast } = useToast();
	const { t } = useI18n();

	const handleExport = async () => {
		setExporting(true);
		try {
			const res = await exportUserData();
			if (res.ok) {
				const blob = new Blob([res.data], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `trashydance-data-export-${new Date().toISOString().split("T")[0]}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast("Data exported successfully!", "success");
			} else {
				toast(res.error, "error");
			}
		} catch {
			toast("Something went wrong", "error");
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className="mt-4 flex flex-col gap-3 rounded-base border-4 border-border bg-card p-6 shadow-shadow">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide">
						{t("exportData")}
					</p>
					<p className="text-xs text-muted-foreground">{t("exportDataDesc")}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleExport}
					disabled={exporting}
				>
					<Download className="size-4" />
					{exporting ? t("saving") : t("exportBtn")}
				</Button>
			</div>
		</div>
	);
}
