import { and, eq, or } from "drizzle-orm";
import db from "@/lib/db";
import { conversation } from "@/schema";

export function getPartnerId(
	conv: { userAId: string; userBId: string },
	userId: string,
): string {
	return conv.userAId === userId ? conv.userBId : conv.userAId;
}

export function isParticipant(
	conv: { userAId: string; userBId: string },
	userId: string,
): boolean {
	return conv.userAId === userId || conv.userBId === userId;
}

export function getUserLastReadAt(
	conv: {
		userAId: string;
		userBId: string;
		userALastReadAt: Date | null;
		userBLastReadAt: Date | null;
	},
	userId: string,
): Date | null {
	return conv.userAId === userId ? conv.userALastReadAt : conv.userBLastReadAt;
}

export function findConversationForParticipant(
	conversationId: string,
	userId: string,
) {
	return db
		.select()
		.from(conversation)
		.where(
			and(
				eq(conversation.id, conversationId),
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			),
		)
		.get();
}
