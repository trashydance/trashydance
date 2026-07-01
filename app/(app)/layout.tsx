import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "@/components/feature/app-nav";
import { BrandLogo } from "@/components/feature/brand-logo";
import { TetrisEasterEgg } from "@/components/feature/tetris-easter-egg";
import { ToastProvider } from "@/components/ui/toast";
import { COPYRIGHT_NOTICE } from "@/lib/constants";
import { getNotificationCounts } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
	const me = await getCurrentUser();
	const counts = me ? await getNotificationCounts(me.id) : null;

	return (
		<ToastProvider>
			<TetrisEasterEgg />
			<div className="flex min-h-svh flex-col">
				<header className="sticky top-0 z-40 border-b-2 border-border bg-background">
					<div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
						<BrandLogo />
						<AppNav initialCounts={counts ?? undefined} />
					</div>
				</header>

				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
					{children}
				</main>

				<footer className="border-t-2 border-border bg-background">
					<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
						<p className="text-xs font-bold uppercase tracking-wide">
							{COPYRIGHT_NOTICE}
						</p>
						<div className="flex items-center gap-4">
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
					</div>
				</footer>
			</div>
		</ToastProvider>
	);
}
