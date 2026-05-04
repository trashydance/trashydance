"use client";

import { BarChart2, Play, Settings, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
	const params = useParams();
	const roomId = params.id as string;
	const [roomName, setRoomName] = useState("Room");

	useEffect(() => {
		const saved = localStorage.getItem("trashydance_rooms");
		if (saved) {
			const rooms = JSON.parse(saved) as Array<{ id: string; name?: string }>;
			const currentRoom = rooms.find((room) => room.id === roomId);
			if (currentRoom?.name) {
				setRoomName(currentRoom.name);
			}
		}
	}, [roomId]);

	return (
		<>
			{/* TOP RIGHT: EXIT AND SETTINGS BUTTONS */}
			<div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 flex items-center gap-4">
				<Link
					href="/settings"
					className="w-14 h-14 sm:w-16 sm:h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none hover:bg-gray-100 transition-all cursor-pointer group"
				>
					<Settings
						className="w-6 h-6 sm:w-8 sm:h-8 text-black group-hover:rotate-90 transition-transform duration-300"
						strokeWidth={3}
					/>
				</Link>
				<Link
					href="/rooms"
					className="w-14 h-14 sm:w-16 sm:h-16 bg-red-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none hover:bg-red-500 transition-all cursor-pointer"
				>
					<X className="w-6 h-6 sm:w-8 sm:h-8 text-black" strokeWidth={4} />
				</Link>
			</div>

			<div className="mt-2 mb-6 sm:mb-8 text-center md:text-left pr-16 sm:pr-32">
				<h1 className="font-black text-4xl sm:text-6xl uppercase tracking-widest text-black">
					{roomName}
				</h1>
				<p className="font-bold text-xl sm:text-3xl mt-2 text-black/60 uppercase">
					Get ready to dance
				</p>
			</div>

			{/* CENTER BUTTONS */}
			<div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-xl mx-auto h-[60%] shrink-0">
				<Link
					href={`/rooms/${roomId}/stats`}
					className="w-full bg-[#b5c7f2] border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none hover:-translate-y-1 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-between text-black"
				>
					<span className="font-black text-2xl sm:text-4xl uppercase">
						Room Stats
					</span>
					<BarChart2 className="w-8 h-8 sm:w-12 sm:h-12" strokeWidth={2.5} />
				</Link>

				<Link
					href={`/rooms/${roomId}/play`}
					className="w-full bg-yellow-300 border-4 border-black rounded-3xl p-8 sm:p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none hover:-translate-y-2 hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-between text-black mt-4"
				>
					<span className="font-black text-4xl sm:text-6xl uppercase tracking-wider">
						Play
					</span>
					<Play
						className="w-10 h-10 sm:w-20 sm:h-20"
						fill="currentColor"
						strokeWidth={2.5}
					/>
				</Link>
			</div>

			{/* BOTTOM RIGHT: ROOM CODE */}
			<div className="flex justify-center md:absolute md:bottom-8 md:right-8 mt-12 md:mt-0 relative pb-10 md:pb-0">
				<div className="bg-white border-4 border-black rounded-2xl px-6 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform md:rotate-[-2deg] active:rotate-0 transition-transform">
					<div className="flex flex-col items-center md:items-end p-1">
						<span className="font-black uppercase text-black/50 text-sm tracking-widest border-b-2 border-black/20 pb-1 mb-1 w-full text-center md:text-right">
							Room Code
						</span>
						<span className="font-black text-3xl sm:text-4xl tracking-widest text-black uppercase">
							{roomId.substring(0, 6) || "A7X9"}
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
