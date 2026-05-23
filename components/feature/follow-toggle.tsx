"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/use-follow";

interface FollowToggleProps {
	userId: string;
	initialIsFollowing: boolean;
	className?: string;
}

export function FollowToggle({
	userId,
	initialIsFollowing,
	className,
}: FollowToggleProps) {
	const { isFollowing, toggleFollow, isLoading } = useFollow(
		userId,
		initialIsFollowing,
	);

	return (
		<Button
			variant={isFollowing ? "outline" : "default"}
			size="sm"
			onClick={toggleFollow}
			disabled={isLoading}
			className={className}
		>
			{isFollowing ? (
				<>
					<UserMinus className="size-4" />
					Unfollow
				</>
			) : (
				<>
					<UserPlus className="size-4" />
					Follow
				</>
			)}
		</Button>
	);
}
