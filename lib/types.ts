export type FriendStatus =
	| "none"
	| "pending_sent"
	| "pending_received"
	| "friends";

export interface User {
	id: string;
	username?: string | null;
	name: string;
	email: string;
	image?: string | null;
	createdAt: string | Date;
	lastName?: string | null;
	bio?: string | null;
	twoFactorEnabled?: boolean | null;
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
		// number (ms) from the server DTO, ISO string from socket events
		createdAt: string | number | null;
		senderId: string;
	} | null;
	lastMessageAt?: number | null;
	isFriend: boolean;
	unreadCount?: number;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	// number (ms) from the server, ISO string for optimistic messages
	createdAt: string | number | null;
	status?: "sending" | "sent" | "error";
	fileName?: string;
	fileUrl?: string;
	fileType?: string;
	fileSize?: number;
}

export interface SearchUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
	friendStatus: FriendStatus;
	friendRequestId: string | null;
}

export interface SearchResults {
	users: Array<User & { friendStatus: FriendStatus }>;
	messages: Array<
		Message & { conversationId: string; partnerUsername: string }
	>;
}

export interface Profile {
	id: string;
	username: string;
	name: string;
	lastName: string | null;
	bio: string | null;
	image: string | null;
	intraLogin: string | null;
	createdAt: number;
	friendCount: number;
	friendStatus: FriendStatus;
	friendRequestId: string | null;
	isOwnProfile: boolean;
}
