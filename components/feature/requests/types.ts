export interface FriendRequestUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
}

export interface ReceivedRequest {
	id: string;
	sender: FriendRequestUser;
	status: string;
	createdAt: number | null;
}

export interface SentRequest {
	id: string;
	receiver: FriendRequestUser;
	status: string;
	createdAt: number | null;
}

export interface FriendEntry {
	id: string;
	friend: FriendRequestUser;
	createdAt: number | null;
}

export interface FriendRequestsData {
	received: ReceivedRequest[];
	sent: SentRequest[];
	accepted: FriendEntry[];
}
