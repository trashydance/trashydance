export interface User {
	id: string;
	username: string;
	name: string;
	email: string;
	image: string | null;
	createdAt: string;
}

export interface Conversation {
	id: string;
	partner: {
		id: string;
		username: string;
		name: string;
		image: string | null;
	};
	lastMessage: {
		body: string;
		createdAt: string;
		senderId: string;
	} | null;
	isFollowing: boolean;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	createdAt: string;
	status?: "sending" | "sent" | "error";
}

export interface SearchResults {
	users: Array<User & { isFollowing: boolean }>;
	messages: Array<
		Message & { conversationId: string; partnerUsername: string }
	>;
}

export interface Profile {
	username: string;
	name: string;
	image: string | null;
	createdAt: string;
	followerCount: number;
	followingCount: number;
	isFollowedByMe: boolean;
}
