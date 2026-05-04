"use client";

import { Send, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const avatarSlots = [
		{ id: "you", isUser: true },
		{ id: "player-2", isUser: false },
		{ id: "player-3", isUser: false },
		{ id: "player-4", isUser: false },
	];

	const params = useParams();
	const roomId = params.id as string;
	const [roomColor, setRoomColor] = useState("#ffd1dc");
	const [playersCount, setPlayersCount] = useState(1);
	const [userProfile, setUserProfile] = useState({
		username: "You",
		avatarColor: "#c2f2d0",
	});

	useEffect(() => {
		const saved = localStorage.getItem("trashydance_rooms");
		if (saved) {
			const rooms = JSON.parse(saved) as Array<{
				id: string;
				color?: string;
				players?: number;
			}>;
			const currentRoom = rooms.find((room) => room.id === roomId);
			if (currentRoom) {
				if (currentRoom.color) setRoomColor(currentRoom.color);
				if (currentRoom.players) setPlayersCount(currentRoom.players);
			}
		}

		// Load user profile mapped settings
		const loadProfile = () => {
			const savedProfile = localStorage.getItem("trashydance_user_profile");
			if (savedProfile) {
				setUserProfile(JSON.parse(savedProfile));
			}
		};
		loadProfile();

		window.addEventListener("profileStatsUpdated", loadProfile);
		return () => window.removeEventListener("profileStatsUpdated", loadProfile);
	}, [roomId]);

	// Mock chat state
	const [message, setMessage] = useState("");
	const [chat, setChat] = useState([
		{ user: "System", text: "Welcome to the room!", color: "#b5c7f2" },
		{ user: "PlayerOne", text: "Ready when you are", color: "#ffd1dc" },
	]);

	const sendMessage = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!message.trim()) return;
		setChat([
			...chat,
			{
				user: userProfile.username || "You",
				text: message,
				color: userProfile.avatarColor || "#c2f2d0",
			},
		]);
		setMessage("");
	};

	return (
		<div className="h-[100dvh] w-full flex flex-col md:flex-row bg-[#fdfbf7] p-4 sm:p-8 gap-8 overflow-hidden font-sans">
			{/* --- LEFT SIDE: CHAT (ALWAYS OPEN) --- */}
			<div className="w-full md:w-1/3 min-w-[320px] h-[40vh] md:h-full flex flex-col bg-[#ffd1dc] border-4 border-black rounded-[40px] shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden shrink-0">
				{/* Chat Header */}
				<div className="p-4 sm:p-6 border-b-4 border-black bg-white flex flex-col gap-4 shrink-0 z-10">
					<div className="flex items-center justify-between">
						<h2 className="font-black text-2xl sm:text-3xl uppercase tracking-widest text-black">
							Chat
						</h2>
						<div className="flex items-center gap-2">
							<span className="font-bold text-sm uppercase text-black/50 hidden lg:inline-block">
								Live
							</span>
							<div className="w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
						</div>
					</div>

					{/* Player Avatars */}
					<div className="flex items-center justify-center gap-3">
						{avatarSlots.map((slot, index) => {
							const isUser = slot.isUser;
							const hasPlayer = index < playersCount;
							return (
								<div
									key={slot.id}
									className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-black flex items-center justify-center overflow-hidden ${hasPlayer ? "shadow-[4px_4px_0_0_rgba(0,0,0,1)]" : "opacity-50"}`}
									style={{
										backgroundColor: isUser
											? userProfile.avatarColor
											: hasPlayer
												? roomColor
												: "#e5e7eb",
									}}
								>
									{isUser ? (
										<div className="font-bold flex items-center justify-center bg-white/20 w-full h-full text-black text-sm">
											{userProfile.username
												? userProfile.username.substring(0, 2).toUpperCase()
												: "ME"}
										</div>
									) : (
										<User
											className="w-5 h-5 sm:w-6 sm:h-6 text-black"
											strokeWidth={3}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Messages Area */}
				<div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#ffd1dc] custom-scroll">
					{chat.map((msg) => {
						const isMe =
							msg.user === userProfile.username || msg.user === "You";
						return (
							<div key={`${msg.user}-${msg.text}`} className="flex flex-col">
								<span className="font-black uppercase text-sm mb-1 text-black/80">
									{msg.user}
								</span>
								<div
									className="border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black font-bold text-lg"
									style={{
										backgroundColor: isMe
											? userProfile.avatarColor
											: msg.color || "white",
									}}
								>
									{msg.text}
								</div>
							</div>
						);
					})}
				</div>

				{/* Input Area */}
				<div className="p-4 sm:p-6 border-t-4 border-black bg-white shrink-0">
					<form onSubmit={sendMessage} className="flex relative">
						<input
							className="w-full border-4 border-black rounded-2xl p-4 pr-16 font-bold text-xl uppercase outline-none focus:bg-pink-100 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black placeholder:text-black/30"
							placeholder="Type..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button
							type="submit"
							onClick={(e) => sendMessage(e)}
							className="absolute right-2 top-2 bottom-2 w-12 bg-yellow-300 border-4 border-black rounded-xl flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-yellow-400 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
						>
							<Send className="w-6 h-6 text-black -ml-1" strokeWidth={3} />
						</button>
					</form>
				</div>
			</div>

			{/* --- RIGHT SIDE: DYNAMIC CHILDREN --- */}
			<div className="flex-1 h-[55vh] md:h-full relative bg-[#c2f2d0] border-4 border-black rounded-[40px] shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 sm:p-10 lg:p-12 overflow-y-auto custom-scroll">
				{children}
			</div>
		</div>
	);
}
