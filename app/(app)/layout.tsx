import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "@/components/feature/app-nav";
import { AppIcon } from "@/components/icons/app-icon";
import { ToastProvider } from "@/components/ui/toast";
import { getNotificationCounts } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
	const me = await getCurrentUser();
	const counts = me ? await getNotificationCounts(me.id) : null;

	return (
		<ToastProvider>
			<div className="flex min-h-svh flex-col">
				<header className="sticky top-0 z-40 border-b-2 border-border bg-background">
					<div className="flex h-14 items-center justify-between px-4 sm:px-6">
						<Link
							href="/home"
							className="flex items-center gap-2 font-heading text-lg font-bold"
						>
							<AppIcon className="size-6" />
							<span className="hidden sm:inline">trashydance</span>
						</Link>
						<AppNav initialCounts={counts ?? undefined} />
					</div>
				</header>

				<main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
					{children}
				</main>

				<footer className="border-t-2 border-border bg-background">
					<div className="mx-auto flex max-w-2xl items-center justify-center gap-4 px-4 py-3">
						<Link
							href="/privacy"
							className="text-xs text-muted-foreground hover:text-foreground hover:underline"
						>
							Privacy
						</Link>
						<Link
							href="/terms"
							className="text-xs text-muted-foreground hover:text-foreground hover:underline"
						>
							Terms
						</Link>
					</div>
				</footer>
			</div>
		</ToastProvider>
	);
}
