"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CLOUD_COLORS = ["#ffd1dc", "#e8f0fe", "#d4f0f0", "#fcf4dd", "#e1d4f0"];

export default function NewRoomPage() {
	const router = useRouter();
	const [cloudColor, setCloudColor] = useState(CLOUD_COLORS[0]);
	const [cloudName, setCloudName] = useState("");
	const [cloudCode, setCloudCode] = useState("");

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO Backend: Inviare i dati della stanza al server (nome, colore, codice segreto).

		// Gestione Mock LocalStorage
		const saved = localStorage.getItem("trashydance_rooms");
		const rooms = saved ? JSON.parse(saved) : [];
		if (rooms.length >= 6) {
			alert("Limit of 6 active clouds reached!");
			return;
		}

		const newRoom = {
			id: Math.random().toString(36).substring(7),
			name: cloudName || "NEW CLOUD",
			color: cloudColor,
			players: 1,
			participants: [{ id: "admin", name: "You (Admin)", wins: 0 }],
		};

		rooms.push(newRoom);
		localStorage.setItem("trashydance_rooms", JSON.stringify(rooms));

		// Simulate backend call
		setTimeout(() => {
			router.push("/rooms");
		}, 100);
	};

	return (
		<div className="relative min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-500">
			{/* Top Right: Close button */}
			<div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
				<Link
					href="/rooms"
					className="flex items-center justify-center w-12 h-12 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer group"
					style={{ backgroundColor: cloudColor }}
				>
					<X
						className="w-6 h-6 text-black group-hover:scale-110 transition-transform"
						strokeWidth={3}
					/>
				</Link>
			</div>

			{/* Main card */}
			<div
				className="w-full max-w-lg border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-[40px] p-8 sm:p-12 text-black relative z-10 transition-colors duration-300"
				style={{ backgroundColor: cloudColor }}
			>
				{/* Title */}
				<h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider mb-10 text-center drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
					Cloud Generator
				</h1>

				<form onSubmit={handleCreate} className="flex flex-col gap-8">
					{/* Cloud Name */}
					<div className="flex flex-col gap-3">
						<label
							htmlFor="cloud-name"
							className="font-bold text-xl uppercase tracking-wide"
						>
							Cloud Name
						</label>
						<input
							id="cloud-name"
							type="text"
							required
							maxLength={9}
							value={cloudName}
							onChange={(e) => setCloudName(e.target.value)}
							placeholder="E.g. MY SUPER ROOM"
							className="w-full text-xl font-bold p-4 border-4 border-black rounded-xl outline-none focus:bg-pink-100 transition-colors uppercase placeholder:text-gray-400"
						/>
					</div>

					{/* Cloud Color */}
					<fieldset className="flex flex-col gap-3">
						<legend className="font-bold text-xl uppercase tracking-wide">
							Cloud Color
						</legend>
						<div className="flex gap-4 flex-wrap">
							{CLOUD_COLORS.map((color) => (
								<button
									key={color}
									type="button"
									onClick={() => setCloudColor(color)}
									className={`w-12 h-12 rounded-full border-4 border-black transition-transform ${cloudColor === color ? "scale-125 shadow-[4px_4px_0_0_rgba(0,0,0,1)]" : "hover:scale-110"}`}
									style={{ backgroundColor: color }}
									aria-label={`Select color ${color}`}
								/>
							))}
						</div>
					</fieldset>

					{/* Cloud Code */}
					<div className="flex flex-col gap-3">
						<label
							htmlFor="cloud-code"
							className="font-bold text-xl uppercase tracking-wide"
						>
							Secret Code
						</label>
						<input
							id="cloud-code"
							type="text"
							required
							value={cloudCode}
							onChange={(e) => setCloudCode(e.target.value)}
							placeholder="E.g. SECRET123"
							className="w-full text-xl font-bold p-4 border-4 border-black rounded-xl outline-none focus:bg-pink-100 transition-colors uppercase placeholder:text-gray-400 tracking-widest"
						/>
					</div>

					{/* Create Button */}
					<button
						type="submit"
						className="mt-6 flex items-center justify-between w-full text-black bg-white border-4 border-black font-black text-2xl uppercase py-6 px-8 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all group"
					>
						<span>Create</span>
						<ArrowRight
							className="w-8 h-8 text-black group-hover:translate-x-2 transition-transform"
							strokeWidth={4}
						/>
					</button>
				</form>
			</div>
		</div>
	);
}
