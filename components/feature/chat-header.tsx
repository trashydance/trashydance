"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowToggle } from "./follow-toggle";

interface ChatHeaderProps {
	partnerId: string;
	partnerUsername: string;
	partnerImage: string | null;
	isFollowing: boolean;
}

export function ChatHeader({
	partnerId,
	partnerUsername,
	partnerImage,
	isFollowing,
}: ChatHeaderProps) {
	const initials = partnerUsername.slice(0, 2).toUpperCase();

	return (
		<header className="flex items-center gap-3 border-b-2 border-foreground bg-card px-4 py-3 shadow-[0px_4px_0px_0px] shadow-foreground">
			<Button variant="ghost" size="icon-sm" asChild>
				<Link href="/home" aria-label="Back to chats">
					<ArrowLeft className="size-4" />
				</Link>
			</Button>
			<Link
				href={`/profile/${partnerUsername}`}
				className="flex items-center gap-2"
			>
				<Avatar>
					{partnerImage && (
						<AvatarImage src={partnerImage} alt={partnerUsername} />
					)}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<span className="font-heading text-sm font-semibold">
					{partnerUsername}
				</span>
			</Link>
			<div className="ml-auto">
				<FollowToggle userId={partnerId} initialIsFollowing={isFollowing} />
			</div>
		</header>
	);
}
