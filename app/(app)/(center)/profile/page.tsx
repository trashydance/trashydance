"use client";

import { Paintbrush } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoomsButton from "../rooms-button";
import SignoutButton from "./signout-button";

const COLORS = [
	"#fdfbf7",
	"#ffd1dc",
	"#c2f2d0",
	"#b5c7f2",
	"#f2c2e0",
	"#fce2c2",
	"#e6e6fa",
];

export default function Page() {
	// Profile State
	const [username, setUsername] = useState("Player One");
	const [avatarColor, setAvatarColor] = useState(COLORS[0]);

	return (
		<>
			<RoomsButton />

			{/* Togglone / Scroll On-Off Top */}
			<div className="relative w-full max-w-sm h-20 bg-white border-4 border-black rounded-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex p-2 mb-12 shrink-0 select-none">
				<div className="absolute top-2 bottom-2 w-[calc(50%-0.5rem)] bg-pink-500 border-4 border-black rounded-full transition-transform duration-300 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.2)] translate-x-0" />
				<div
					className={`relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl`}
					style={{ color: "white" }}
				>
					<span>Profile</span>
				</div>
				<a
					href="/settings"
					className="relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl"
					style={{ color: "black" }}
				>
					<span>Settings</span>
				</a>
			</div>

			{/* Main Content Area */}
			<div className="w-full max-w-5xl relative z-10 flex flex-col items-center pb-24">
				<div className="w-full max-w-4xl bg-[#ffd1dc] border-4 border-black rounded-[40px] shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-black">
					{/* Sezione Avatar */}
					<div className="flex flex-col items-center gap-6 md:w-1/2">
						<h2 className="font-black text-4xl uppercase tracking-widest text-center">
							Customize
						</h2>

						{/* Avatar Preview */}
						<div
							className="w-40 h-40 border-[6px] border-black rounded-full flex items-center justify-center overflow-hidden transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-white shrink-0"
							style={{ backgroundColor: avatarColor }}
						>
							<Avatar className="w-full h-full rounded-none bg-transparent">
								<AvatarImage
									src="/avatars/shadcn.jpg"
									className="object-cover mix-blend-multiply"
								/>
								<AvatarFallback className="bg-transparent font-black text-5xl">
									XD
								</AvatarFallback>
							</Avatar>
						</div>

						<Link href="/settings/avatar">
							<button
								type="button"
								className="bg-yellow-300 border-4 border-black px-8 py-4 font-black uppercase tracking-wider rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-yellow-400 transition-all text-xl mt-2"
							>
								Change Avatar
							</button>
						</Link>
					</div>

					{/* Divisore Inverso */}
					<div className="hidden md:block w-0 h-64 border-l-4 border-black border-dashed mx-6" />
					<div className="md:hidden w-full border-t-4 border-black border-dashed my-2" />

					{/* Sezione Inputs */}
					<div className="flex flex-col gap-8 md:w-1/2 w-full max-w-md">
						{/* Username Input */}
						<div className="w-full flex flex-col gap-4">
							<label
								htmlFor="username"
								className="font-black text-2xl uppercase flex items-center gap-2"
							>
								<Paintbrush className="w-6 h-6" /> Username
							</label>
							<input
								id="username"
								className="border-4 border-black rounded-2xl p-6 font-bold text-3xl uppercase outline-none focus:bg-pink-100 transition-colors w-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] placeholder:text-black/30"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter name..."
							/>
						</div>

						{/* Icon Background */}
						<div className="w-full flex flex-col gap-4">
							<div className="font-black text-2xl uppercase">
								Icon Background
							</div>
							<div className="flex flex-wrap gap-4 justify-start">
								{COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setAvatarColor(c)}
										className={`w-14 h-14 rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:scale-95 transition-all ${
											avatarColor === c
												? "scale-110 ring-4 ring-black ring-offset-4 ring-offset-[#ffd1dc]"
												: "hover:scale-105"
										}`}
										style={{ backgroundColor: c }}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<SignoutButton />
		</>
	);
}
