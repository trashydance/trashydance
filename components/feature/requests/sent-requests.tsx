import { Clock } from "lucide-react";
import { SectionHeader } from "@/components/feature/section-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";
import { FriendCard } from "./friend-card";
import type { SentRequest } from "./types";

interface SentRequestsProps {
	requests: SentRequest[];
	onCancel: (id: string) => void;
	loadingId: string | null;
}

export function SentRequests({
	requests,
	onCancel,
	loadingId,
}: SentRequestsProps) {
	const { t } = useI18n();

	if (requests.length === 0) return null;

	return (
		<section>
			<SectionHeader title={t("sentRequests")} count={requests.length} />
			<div className="space-y-2">
				{requests.map((req) => (
					<FriendCard
						key={req.id}
						user={req.receiver}
						subtitle={t("friendRequestPending")}
					>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onCancel(req.id)}
							disabled={loadingId === req.id}
						>
							<Clock className="size-4" />
							{t("cancel")}
						</Button>
					</FriendCard>
				))}
			</div>
		</section>
	);
}
