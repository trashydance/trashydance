import Link from "next/link";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		
				<div className="flex flex-col gap-4">
					{children}
					<footer>
						<Link href="/privacy">
							<Button variant="link" size="xs">
								Privacy
							</Button>
						</Link>
						<Link href="/terms">
							<Button variant="link" size="xs">
								Terms
							</Button>
						</Link>
					</footer>
				</div>
	);
}
