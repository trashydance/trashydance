"use client";

import {
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
import { NotificationBadge } from "@/components/feature/notification-badge";
import { useNotificationCount } from "@/hooks/use-notification-count";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";

export function AppNav() {
	const router = useRouter();
	const { theme, toggleTheme } = useTheme();
	const { pendingRequests, unreadChats } = useNotificationCount();

	const handleLogout = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	return (
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
				href="/requests"
				className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<Users className="size-4" />
				<span className="hidden sm:inline">Requests</span>
				{pendingRequests > 0 && (
					<NotificationBadge
						count={pendingRequests}
						className="absolute -top-1 -right-1"
					/>
				)}
			</Link>
			<Link
				href="/profile/me"
				className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<User className="size-4" />
				<span className="hidden sm:inline">Profile</span>
			</Link>
			<Link
				href="/settings"
				className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
			>
				<Settings className="size-4" />
				<span className="hidden sm:inline">Settings</span>
			</Link>
			<button
				type="button"
				onClick={toggleTheme}
				className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
				aria-label="Toggle theme"
			>
				{theme === "dark" ? (
					<Sun className="size-4" />
				) : (
					<Moon className="size-4" />
				)}
			</button>
			<button
				type="button"
				onClick={handleLogout}
				className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
				aria-label="Log out"
			>
				<LogOut className="size-4" />
				<span className="hidden sm:inline">Logout</span>
			</button>
		</nav>
	);
}
