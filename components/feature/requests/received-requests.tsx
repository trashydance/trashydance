import { Check, X } from "lucide-react";
import { SectionHeader } from "@/components/feature/section-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";
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
	const { t } = useI18n();

	if (requests.length === 0) return null;

	return (
		<section>
			<SectionHeader title={t("receivedRequests")} count={requests.length} />
			<div className="space-y-2">
				{requests.map((req) => (
					<FriendCard
						key={req.id}
						user={req.sender}
						subtitle={t("wantsToBeFriends")}
					>
						<Button
							variant="default"
							size="sm"
							onClick={() => onAccept(req.id)}
							disabled={loadingId === req.id}
						>
							<Check className="size-4" />
							{t("accept")}
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onReject(req.id)}
							disabled={loadingId === req.id}
							className="bg-accent text-accent-foreground"
						>
							<X className="size-4" />
							{t("reject")}
						</Button>
					</FriendCard>
				))}
			</div>
		</section>
	);
}
