"use client";

import {
	EllipsisVertical,
	Home,
	LogOut,
	Moon,
	Search,
	Settings,
	Sun,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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

export function AppNav() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { pendingRequests } = useNotificationCount();
	const { socket } = useSocket();

	const handleLogout = async () => {
		socket?.disconnect();
		await authClient.signOut();
		router.push("/login");
	};

	return (
		<nav className="flex items-center gap-1">
			<Link
				href="/home"
				className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<Home className="size-4" />
				<span className="hidden sm:inline">Home</span>
			</Link>
			<Link
				href="/search"
				className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<Search className="size-4" />
				<span className="hidden sm:inline">Search</span>
			</Link>
			<Link
				href="/friends"
				className="relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<Users className="size-4" />
				<span className="hidden sm:inline">Friends</span>
				{pendingRequests > 0 && (
					<NotificationBadge
						count={pendingRequests}
						className="absolute -top-1 -right-1"
					/>
				)}
			</Link>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="ml-1 inline-flex size-8 items-center justify-center rounded-base text-sm"
						aria-label="Menu"
					>
						<EllipsisVertical className="size-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem asChild>
						<Link href="/profile/me" className="flex items-center gap-2">
							<User className="size-4" />
							Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/settings" className="flex items-center gap-2">
							<Settings className="size-4" />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setTheme(theme === "dark" ? "light" : "dark");
						}}
						className="flex items-center gap-2"
					>
						{theme === "dark" ? (
							<Sun className="size-4" />
						) : (
							<Moon className="size-4" />
						)}
						{theme === "dark" ? "Light mode" : "Dark mode"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={handleLogout}
						className="flex items-center gap-2"
					>
						<LogOut className="size-4" />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}
