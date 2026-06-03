import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendCard } from "./friend-card";
import type { ReceivedRequest } from "./types";

interface ReceivedRequestsProps {
	requests: ReceivedRequest[];
	onAccept: (id: string) => void;
	onReject: (id: string) => void;
	loadingId: string | null;
}

export function ReceivedRequests({
	requests,
	onAccept,
	onReject,
	loadingId,
}: ReceivedRequestsProps) {
	if (requests.length === 0) return null;

	return (
		<section>
			<h2 className="mb-3 font-heading text-lg font-bold">Received</h2>
			<div className="space-y-2">
				{requests.map((req) => (
					<FriendCard key={req.id} user={req.sender}>
						<Button
							variant="default"
							size="sm"
							onClick={() => onAccept(req.id)}
							disabled={loadingId === req.id}
						>
							<Check className="size-4" />
							Accept
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onReject(req.id)}
							disabled={loadingId === req.id}
						>
							<X className="size-4" />
							Reject
						</Button>
					</FriendCard>
				))}
			</div>
		</section>
	);
}
