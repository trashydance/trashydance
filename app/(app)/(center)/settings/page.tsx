"use client";

import { Moon, Sun, Type, Volume2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import RoomsButton from "../rooms-button";

export default function SettingsPage() {
	// Settings State
	const [masterVolume, setMasterVolume] = useState(75);
	const [sfxVolume, setSfxVolume] = useState(50);
	const [fontFamily, setFontFamily] = useState<
		"leggibile" | "simpatico" | "creativo"
	>("leggibile");
	const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
	const [isNightMode, setIsNightMode] = useState(false);
	const [isCurseMode, setIsCurseMode] = useState(false);

	const [activeSetting, setActiveSetting] = useState<
		"audio" | "font" | "theme" | "curse"
	>("audio");

	return (
		<>
			<RoomsButton />

			{/* Togglone / Scroll On-Off Top */}
			<div className="relative w-full max-w-sm h-20 bg-white border-4 border-black rounded-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex cursor-pointer p-2 mb-12 shrink-0 select-none">
				<div
					className={`absolute top-2 bottom-2 w-[calc(50%-0.5rem)] bg-pink-500 border-4 border-black rounded-full transition-transform duration-300 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.2)] ${"translate-x-full"}`}
				/>
				<Link
					href="/profile"
					className={`relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl`}
					style={{ color: "black" }}
				>
					<span>Profile</span>
				</Link>
				<div
					className={`relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl`}
					style={{ color: "white" }}
				>
					<span>Settings</span>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="w-full max-w-5xl relative z-10 flex flex-col items-center pb-24">
				<div className="w-full bg-[#fdfbf7] border-4 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex overflow-hidden min-h-[500px] flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500 text-black">
					{/* Sidebar Helpler */}
					<div className="md:w-[250px] lg:w-[300px] bg-white border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-row md:flex-col gap-4 overflow-x-auto shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.05)] z-10 custom-scroll">
						<div className="hidden md:block mb-6">
							<h3 className="font-black text-3xl uppercase">Menu</h3>
						</div>
						<NavButton
							icon={<Volume2 />}
							label="Audio"
							active={activeSetting === "audio"}
							onClick={() => setActiveSetting("audio")}
						/>
						<NavButton
							icon={<Type />}
							label="Font"
							active={activeSetting === "font"}
							onClick={() => setActiveSetting("font")}
						/>
						<NavButton
							icon={<Sun />}
							label="Theme"
							active={activeSetting === "theme"}
							onClick={() => setActiveSetting("theme")}
						/>
						<NavButton
							icon={<Wand2 />}
							label="Curse Mode"
							active={activeSetting === "curse"}
							onClick={() => setActiveSetting("curse")}
						/>
					</div>

					{/* Content Area (No Scroll) */}
					<div className="flex-1 p-4 sm:p-8 flex flex-col bg-transparent relative justify-center">
						{/* AUDIO SECTION */}
						{activeSetting === "audio" && (
							<div className="bg-[#b5c7f2] border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
								<h2 className="font-black text-4xl uppercase flex items-center gap-4">
									<Volume2 className="w-10 h-10" /> Audio
								</h2>
								<div className="space-y-8">
									{/* Master */}
									<div className="flex flex-col gap-4">
										<div className="font-bold uppercase text-2xl flex justify-between">
											<span>Generale</span>
											<span className="bg-white border-2 border-black rounded-lg px-3">
												{isCurseMode ? "***" : masterVolume}%
											</span>
										</div>
										<input
											type="range"
											min="0"
											max="100"
											className="w-full h-8 bg-white border-4 border-black rounded-full appearance-none accent-pink-500 cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
											value={masterVolume}
											onChange={(e) => setMasterVolume(Number(e.target.value))}
										/>
									</div>
									{/* Effects */}
									<div className="flex flex-col gap-4">
										<div className="font-bold uppercase text-2xl flex justify-between">
											<span>Effetti Sonori</span>
											<span className="bg-white border-2 border-black rounded-lg px-3">
												{isCurseMode ? "***" : sfxVolume}%
											</span>
										</div>
										<input
											type="range"
											min="0"
											max="100"
											className="w-full h-8 bg-white border-4 border-black rounded-full appearance-none accent-yellow-400 cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
											value={sfxVolume}
											onChange={(e) => setSfxVolume(Number(e.target.value))}
										/>
									</div>
								</div>
							</div>
						)}

						{/* FONT SECTION */}
						{activeSetting === "font" && (
							<div className="bg-[#c2f2d0] border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
								<h2 className="font-black text-4xl uppercase flex items-center gap-4">
									<Type className="w-10 h-10" /> Font Options
								</h2>
								<div className="flex flex-col xl:flex-row gap-8">
									<div className="flex-1 flex flex-col gap-4">
										<div className="font-bold uppercase text-2xl">
											Style (Famiglia)
										</div>
										<div className="flex flex-col gap-3">
											<button
												type="button"
												onClick={() => setFontFamily("leggibile")}
												className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontFamily === "leggibile" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
											>
												Leggibile
											</button>
											<button
												type="button"
												onClick={() => setFontFamily("simpatico")}
												className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontFamily === "simpatico" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
												style={{
													fontFamily:
														'"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
												}}
											>
												Simpatico
											</button>
											<button
												type="button"
												onClick={() => setFontFamily("creativo")}
												className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-serif ${fontFamily === "creativo" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
											>
												Creativo
											</button>
										</div>
									</div>
									{/* Size */}
									<div className="flex-1 flex flex-col gap-4">
										<div className="font-bold uppercase text-2xl">
											Dimensioni
										</div>
										<div className="flex gap-4">
											{(["S", "M", "L"] as const).map((sz) => (
												<button
													type="button"
													key={sz}
													onClick={() => setFontSize(sz)}
													className={`w-16 h-16 sm:w-20 sm:h-20 border-4 border-black rounded-full flex items-center justify-center font-black uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontSize === sz ? "bg-pink-500 text-white scale-110 shadow-none translate-x-1 translate-y-1" : "bg-white text-black hover:bg-gray-100"}`}
													style={{
														fontSize:
															sz === "S"
																? "1rem"
																: sz === "L"
																	? "2.5rem"
																	: "1.5rem",
													}}
												>
													{sz}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* THEME SECTION */}
						{activeSetting === "theme" && (
							<div className="bg-[#e6e6fa] border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
								<h2 className="font-black text-4xl uppercase flex items-center gap-4">
									<Sun className="w-10 h-10" /> Appearance
								</h2>
								<div className="flex items-center gap-6 pb-4">
									<span className="font-bold uppercase text-2xl w-40">
										{isNightMode ? "Night Mode" : "Light Mode"}
									</span>
									{/* Mega switch custom for Theme */}
									<button
										type="button"
										onClick={() => setIsNightMode((p) => !p)}
										className={`relative w-28 h-12 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-1 transition-colors ${isNightMode ? "bg-indigo-900" : "bg-[#fce2c2]"}`}
									>
										<div
											className={`absolute top-1 bottom-1 w-8 bg-white border-2 border-black rounded-full transition-transform flex items-center justify-center ${isNightMode ? "translate-x-[64px]" : "translate-x-0"}`}
										>
											{isNightMode ? (
												<Moon className="w-5 h-5 text-black" />
											) : (
												<Sun className="w-5 h-5 text-black" />
											)}
										</div>
									</button>
								</div>
							</div>
						)}

						{/* CURSE MODE SECTION */}
						{activeSetting === "curse" && (
							<div className="bg-red-400 border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
								<h2 className="font-black text-4xl uppercase flex items-center gap-4">
									<Wand2 className="w-10 h-10 text-black" /> Cursed Mode
								</h2>
								<div className="flex items-center justify-between gap-6 pb-4 bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
									<div className="flex flex-col">
										<span className="font-bold uppercase text-2xl">
											Enable Curse
										</span>
										<span className="font-bold opacity-50">
											Replace all text with asterisks (*)
										</span>
									</div>
									<button
										type="button"
										onClick={() => setIsCurseMode((p) => !p)}
										className={`relative w-24 h-12 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-1 transition-colors shrink-0 ${isCurseMode ? "bg-black" : "bg-gray-300"}`}
									>
										<div
											className={`absolute top-0 bottom-0 my-auto h-8 w-8 bg-white border-2 border-black rounded-full transition-transform flex items-center justify-center ${isCurseMode ? "translate-x-[48px]" : "translate-x-0"}`}
										/>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

function NavButton({
	icon,
	label,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-3 px-6 py-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-yellow-300 transition-all font-black uppercase text-lg shrink-0 whitespace-nowrap ${active ? "bg-yellow-300 translate-x-1 translate-y-1 shadow-none" : "bg-white text-black"}`}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}
