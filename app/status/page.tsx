"use client";

import { Activity, Database, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function StatusPage() {
	const { t } = useI18n();
	const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		fetch("/api/health")
			.then((res) => {
				if (!res.ok) {
					return res.json().then((data) => {
						setDbHealthy(false);
						setErrorMsg(data.error || t("dbConnectionError"));
					});
				}
				return res.json().then(() => {
					setDbHealthy(true);
				});
			})
			.catch((err) => {
				setDbHealthy(false);
				setErrorMsg(err instanceof Error ? err.message : String(err));
			});
	}, [t]);

	const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
		day: i,
		status: "operational",
	}));

	return (
		<div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
			<div className="w-full max-w-2xl rounded-base border-4 border-border bg-main p-6 shadow-shadow mb-6 text-main-foreground">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-black uppercase tracking-tight">
						{t("systemStatus")}
					</h1>
					{dbHealthy === null ? (
						<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-yellow-400 px-3 py-1 text-xs font-bold text-black animate-pulse">
							<span className="h-2 w-2 rounded-full bg-black" />
							{t("loading")}
						</span>
					) : dbHealthy ? (
						<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-green-400 px-3 py-1 text-xs font-bold text-black">
							<span className="h-2 w-2 rounded-full bg-black animate-pulse" />
							{t("allSystemsOperational")}
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
							<span className="h-2 w-2 rounded-full bg-destructive-foreground animate-ping" />
							{t("outage")}
						</span>
					)}
				</div>

				<div className="space-y-4 rounded-base border-4 border-border bg-card p-6 text-card-foreground shadow-shadow">
					{/* Component 1: Web Server */}
					<div className="flex items-center justify-between border-b-2 border-border pb-3">
						<div className="flex items-center gap-3">
							<Activity className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">{t("webApp")}</p>
								<p className="text-xs text-muted-foreground">
									{t("webAppDesc")}
								</p>
							</div>
						</div>
						<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base text-black">
							{t("operational")}
						</span>
					</div>

					{/* Component 2: Database */}
					<div className="flex items-center justify-between border-b-2 border-border pb-3">
						<div className="flex items-center gap-3">
							<Database className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">{t("dbEngine")}</p>
								<p className="text-xs text-muted-foreground">
									{t("dbEngineDesc")}
								</p>
							</div>
						</div>
						{dbHealthy === null ? (
							<span className="text-xs font-bold uppercase border-2 border-border bg-yellow-400 px-2.5 py-0.5 rounded-base text-black animate-pulse">
								...
							</span>
						) : dbHealthy ? (
							<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base text-black">
								{t("operational")}
							</span>
						) : (
							<span className="text-xs font-bold uppercase border-2 border-border bg-destructive text-destructive-foreground px-2.5 py-0.5 rounded-base">
								{t("outage")}
							</span>
						)}
					</div>

					{/* Component 3: Real-time Gateway */}
					<div className="flex items-center justify-between pb-1">
						<div className="flex items-center gap-3">
							<Network className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">
									{t("realtimeGateway")}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("realtimeGatewayDesc")}
								</p>
							</div>
						</div>
						<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base text-black">
							{t("operational")}
						</span>
					</div>
				</div>

				{/* Uptime History Graph */}
				<div className="mt-6">
					<p className="text-xs font-bold uppercase tracking-wide mb-2">
						{t("systemUptime")}
					</p>
					<div className="flex gap-1">
						{uptimeDays.map((d) => (
							<div
								key={d.day}
								role="img"
								aria-label={`${t("today")}: ${t("uptimePercentage")}`}
								className="h-8 flex-1 rounded-sm border-2 border-border bg-green-400 hover:bg-black transition-colors"
								title={`${t("today")}: ${t("uptimePercentage")}`}
							/>
						))}
					</div>
					<div className="flex justify-between text-[10px] font-bold mt-2">
						<span>{t("daysAgo30")}</span>
						<span>{t("uptimePercentage")}</span>
						<span>{t("today")}</span>
					</div>
				</div>

				{dbHealthy === false && (
					<div className="mt-4 p-3 border-2 border-border bg-destructive/10 text-destructive text-xs rounded-base font-mono">
						<strong>{t("outageDetails")}:</strong> {errorMsg}
					</div>
				)}
			</div>

			<Link
				href="/"
				className="text-sm font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-main hover:text-main-foreground transition-colors px-4 py-2 rounded-base shadow-shadow"
			>
				{t("backToTrashy")}
			</Link>
		</div>
	);
}
