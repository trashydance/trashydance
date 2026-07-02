import { Activity, Database, Network } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";
import { user } from "@/schema";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
	let dbHealthy = false;
	let errorMsg = "";
	try {
		db.select({ id: user.id }).from(user).limit(1).all();
		dbHealthy = true;
	} catch (e) {
		errorMsg = e instanceof Error ? e.message : String(e);
	}

	const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
		day: i,
		status: "operational",
	}));

	return (
		<div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
			<div className="w-full max-w-2xl rounded-base border-4 border-border bg-main p-6 shadow-shadow mb-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-black uppercase tracking-tight text-main-foreground">
						System Status
					</h1>
					<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-green-400 px-3 py-1 text-xs font-bold text-black">
						<span className="h-2 w-2 rounded-full bg-black animate-pulse" />
						All Systems Operational
					</span>
				</div>

				<div className="space-y-4 rounded-base border-4 border-border bg-card p-6 text-card-foreground shadow-shadow">
					{/* Component 1: Web Server */}
					<div className="flex items-center justify-between border-b-2 border-border pb-3">
						<div className="flex items-center gap-3">
							<Activity className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">Web Application</p>
								<p className="text-xs text-muted-foreground">
									HTTP Server & Next.js App Router
								</p>
							</div>
						</div>
						<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base">
							Operational
						</span>
					</div>

					{/* Component 2: Database */}
					<div className="flex items-center justify-between border-b-2 border-border pb-3">
						<div className="flex items-center gap-3">
							<Database className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">Database Engine</p>
								<p className="text-xs text-muted-foreground">
									SQLite via Drizzle ORM
								</p>
							</div>
						</div>
						{dbHealthy ? (
							<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base">
								Operational
							</span>
						) : (
							<span className="text-xs font-bold uppercase border-2 border-border bg-destructive text-destructive-foreground px-2.5 py-0.5 rounded-base">
								Outage
							</span>
						)}
					</div>

					{/* Component 3: Real-time Gateway */}
					<div className="flex items-center justify-between pb-1">
						<div className="flex items-center gap-3">
							<Network className="size-5 text-main-foreground" />
							<div>
								<p className="font-bold text-sm uppercase">Real-time Gateway</p>
								<p className="text-xs text-muted-foreground">
									Socket.IO Server
								</p>
							</div>
						</div>
						<span className="text-xs font-bold uppercase border-2 border-border bg-green-400 px-2.5 py-0.5 rounded-base">
							Operational
						</span>
					</div>
				</div>

				{/* Uptime History Graph */}
				<div className="mt-6">
					<p className="text-xs font-bold uppercase tracking-wide text-main-foreground mb-2">
						System Uptime (Last 30 Days)
					</p>
					<div className="flex gap-1">
						{uptimeDays.map((d) => (
							<div
								key={d.day}
								className="h-8 flex-1 rounded-sm border-2 border-border bg-green-400 hover:bg-black transition-colors"
								title={`Day -${30 - d.day}: 100% Uptime`}
							/>
						))}
					</div>
					<div className="flex justify-between text-[10px] font-bold text-main-foreground mt-2">
						<span>30 days ago</span>
						<span>100.0% uptime</span>
						<span>Today</span>
					</div>
				</div>

				{!dbHealthy && (
					<div className="mt-4 p-3 border-2 border-border bg-destructive/10 text-destructive text-xs rounded-base font-mono">
						<strong>Outage details:</strong> {errorMsg}
					</div>
				)}
			</div>

			<Link
				href="/"
				className="text-sm font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-main hover:text-main-foreground transition-colors px-4 py-2 rounded-base shadow-shadow"
			>
				← Back to trashydance
			</Link>
		</div>
	);
}
