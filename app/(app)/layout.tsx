import { Home, LogOut, Search, User } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/icons/app-icon";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<ToastProvider>
			<div className="flex min-h-svh flex-col">
				<header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
					<div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
						<Link
							href="/home"
							className="flex items-center gap-2 font-heading text-lg font-bold"
						>
							<AppIcon className="size-6" />
							<span className="hidden sm:inline">trashydance</span>
						</Link>

						<nav className="flex items-center gap-1">
							<Link
								href="/home"
								className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
							>
								<Home className="size-4" />
								<span className="hidden sm:inline">Home</span>
							</Link>
							<Link
								href="/search"
								className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
							>
								<Search className="size-4" />
								<span className="hidden sm:inline">Search</span>
							</Link>
							<Link
								href="/profile/me"
								className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
							>
								<User className="size-4" />
								<span className="hidden sm:inline">Profile</span>
							</Link>
							<form action="/api/auth/sign-out" method="POST">
								<button
									type="submit"
									className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
									aria-label="Log out"
								>
									<LogOut className="size-4" />
									<span className="hidden sm:inline">Logout</span>
								</button>
							</form>
						</nav>
					</div>
				</header>

				<main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
					{children}
				</main>

				<footer className="border-t-2 border-foreground bg-background">
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
