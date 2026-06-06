"use client";

import { Home, LogOut, Search, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBadge } from "@/components/feature/notification-badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationCount } from "@/hooks/use-notification-count";
import { useSocket } from "@/hooks/use-socket";
import { authClient } from "@/lib/auth-client";
import { cn, getInitials } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/home", label: "Home", icon: Home },
	{ href: "/search", label: "Search", icon: Search },
	{ href: "/friends", label: "Friends", icon: Users },
] as const;

export function AppNav() {
	const router = useRouter();
	const pathname = usePathname();
	const { pendingRequests } = useNotificationCount();
	const { disconnect } = useSocket();
	const { data: session } = authClient.useSession();

	const user = session?.user;
	const handle =
		(user as { username?: string | null } | undefined)?.username ?? user?.name;
	const initials = getInitials(handle ?? "??");

	const handleLogout = async () => {
		disconnect();
		await authClient.signOut();
		router.push("/login");
	};

	return (
		<div className="flex flex-1 items-center">
			<nav className="ml-6 flex items-center gap-2">
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const active = pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"relative inline-flex items-center gap-1.5 rounded-base border-2 border-border px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-brutal-sm transition-all hover:brutal-press-hover",
								active ? "bg-main text-main-foreground" : "bg-card",
							)}
						>
							<Icon className="size-4" />
							<span className="hidden sm:inline">{label}</span>
							{href === "/friends" && pendingRequests > 0 && (
								<NotificationBadge
									count={pendingRequests}
									className="absolute -right-3 -top-3 z-10"
								/>
							)}
						</Link>
					);
				})}
			</nav>

			<div className="ml-auto flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="inline-flex size-10 items-center justify-center rounded-base border-2 border-border bg-main text-xs font-bold uppercase text-main-foreground shadow-brutal-sm transition-all hover:brutal-press-hover"
							aria-label="Menu"
						>
							{initials}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{user && (
							<div className="border-b-2 border-border px-4 py-3">
								<p className="text-sm font-bold uppercase tracking-wide">
									{user.name}
								</p>
								{handle && (
									<p className="text-xs text-muted-foreground">@{handle}</p>
								)}
							</div>
						)}
						<DropdownMenuItem asChild>
							<Link href="/profile/me" className="flex items-center gap-2">
								<User className="size-4" />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/settings" className="flex items-center gap-2">
								<Settings className="size-4" />
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={handleLogout}
							className="flex items-center gap-2"
						>
							<LogOut className="size-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
