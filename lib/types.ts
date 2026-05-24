export type FriendStatus =
	| "none"
	| "pending_sent"
	| "pending_received"
	| "friends";

export interface User {
	id: string;
	username: string | null;
	name: string;
	email: string;
	image: string | null;
	createdAt: string;
}

export interface Conversation {
	id: string;
	partner: {
		id: string;
		username: string | null;
		name: string;
		image: string | null;
	};
	lastMessage: {
		body: string;
		createdAt: string;
		senderId: string;
	} | null;
	isFriend: boolean;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	createdAt: string;
	status?: "sending" | "sent" | "error";
	fileName?: string;
	fileUrl?: string;
	fileType?: string;
	fileSize?: number;
}

export interface SearchResults {
	users: Array<User & { friendStatus: FriendStatus }>;
	messages: Array<
		Message & { conversationId: string; partnerUsername: string }
	>;
}

export interface Profile {
	username: string;
	name: string;
	image: string | null;
	createdAt: string;
	friendCount: number;
	friendStatus: FriendStatus;
	friendRequestId?: string;
}
