"use client";

import { Home, LogOut, Search, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBadge } from "@/components/feature/notification-badge";
import { UserAvatar } from "@/components/feature/user-avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	type NotificationCount,
	useNotificationCount,
} from "@/hooks/use-notification-count";
import { useSocket } from "@/hooks/use-socket";
import { authClient } from "@/lib/auth-client";
import type { Language } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

interface AppNavProps {
	initialCounts?: NotificationCount;
}

export function AppNav({ initialCounts }: AppNavProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { pendingRequests } = useNotificationCount(initialCounts);
	const { disconnect } = useSocket();
	const { data: session } = authClient.useSession();
	const { language, setLanguage, t } = useI18n();

	const user = session?.user;
	const handle =
		(user as { username?: string | null } | undefined)?.username ?? user?.name;

	const handleLogout = async () => {
		disconnect();
		await authClient.signOut();
		router.push("/login");
	};

	const navItems = [
		{ href: "/home", label: t("inbox").replace(/\.$/, ""), icon: Home },
		{
			href: "/search",
			label: t("findPeople").replace(/\.$/, ""),
			icon: Search,
		},
		{ href: "/friends", label: t("friends").replace(/\.$/, ""), icon: Users },
	];

	return (
		<div className="flex flex-1 items-center">
			<nav className="ml-6 flex items-center gap-2">
				{navItems.map(({ href, label, icon: Icon }) => {
					const active = pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"relative inline-flex items-center gap-1.5 rounded-base border-2 border-border px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-brutal-sm transition-all hover:brutal-press-hover",
								active ? "bg-main text-main-foreground" : "bg-card",
							)}
							aria-label={
								href === "/friends" && pendingRequests > 0
									? `${label}, ${pendingRequests} pending friend requests`
									: label
							}
						>
							<Icon className="size-4" />
							<span className="hidden sm:inline">{label}</span>
							{href === "/friends" && pendingRequests > 0 && (
								<NotificationBadge
									count={pendingRequests}
									className="absolute -right-3 -top-3 z-10"
									title={`${pendingRequests} pending friend requests`}
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
							className="inline-flex size-10 items-center justify-center rounded-base border-2 border-border bg-main text-xs font-bold uppercase text-main-foreground shadow-brutal-sm transition-all hover:brutal-press-hover overflow-hidden"
							aria-label="Menu"
						>
							<UserAvatar
								name={handle ?? null}
								image={user?.image}
								className="size-full rounded-none border-0"
								fallbackClassName="bg-main text-main-foreground text-xs font-bold"
							/>
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
								{t("settings").replace(/\.$/, "")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<div className="px-2 py-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground border-b border-border">
							<span>{t("language")}:</span>
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value as Language)}
								className="ml-auto bg-card border border-border p-1 rounded-sm text-xs font-bold text-foreground focus:outline-none"
							>
								<option value="en">EN</option>
								<option value="it">IT</option>
								<option value="bg">BG</option>
							</select>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={handleLogout}
							className="flex items-center gap-2"
						>
							<LogOut className="size-4" />
							{t("logout")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
