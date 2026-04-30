"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Volume2, Type, Moon, Sun, Wand2, Paintbrush } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COLORS = ["#fdfbf7", "#ffd1dc", "#c2f2d0", "#b5c7f2", "#f2c2e0", "#fce2c2", "#e6e6fa"];

export default function SettingsPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

	// Profile State
	const [username, setUsername] = useState("Player One");
	const [avatarColor, setAvatarColor] = useState(COLORS[0]);
	const [isProfileLoaded, setIsProfileLoaded] = useState(false);

	// Caricamento del profilo da localStorage
	useEffect(() => {
		const saved = localStorage.getItem('trashydance_user_profile');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (parsed.username) setUsername(parsed.username);
				if (parsed.avatarColor) setAvatarColor(parsed.avatarColor);
			} catch (e) {
				console.error(e);
			}
		}
		setIsProfileLoaded(true);
	}, []);

	// Salvataggio del profilo al cambiamento
	useEffect(() => {
		if (isProfileLoaded) {
			localStorage.setItem('trashydance_user_profile', JSON.stringify({ username, avatarColor }));
			// Dispara un evento per notificare le altre pagine (es: top-left avatar in rooms/page.tsx) se necessario
			window.dispatchEvent(new Event('profileStatsUpdated'));
		}
	}, [username, avatarColor, isProfileLoaded]);

	// Settings State
	const [masterVolume, setMasterVolume] = useState(75);
	const [sfxVolume, setSfxVolume] = useState(50);
	const [fontFamily, setFontFamily] = useState<"leggibile" | "simpatico" | "creativo">("leggibile");
	const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
	const [isNightMode, setIsNightMode] = useState(false);
	const [isCurseMode, setIsCurseMode] = useState(false);

	const [activeSetting, setActiveSetting] = useState<"audio" | "font" | "theme" | "curse">("audio");

	// Curse Mode formatter (replaces all characters with * if active)
	const t = (text: string) => (isCurseMode ? "*".repeat(text.length) : text);

	// Determine global font size class
	const textSizeClass = fontSize === "S" ? "text-sm md:text-base" : fontSize === "L" ? "text-xl md:text-2xl" : "text-base md:text-lg";

	// Determine custom font family class
	const fontClass = fontFamily === "leggibile" ? "font-sans" : fontFamily === "creativo" ? "font-serif" : "";
	const customFont = fontFamily === "simpatico" ? '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif' : undefined;

	return (
		<div
			className={`min-h-screen relative overflow-hidden transition-colors duration-500 flex flex-col items-center py-12 px-4 sm:px-8 ${fontClass}`}
			style={{
				backgroundColor: isNightMode ? "#1a202c" : "#e2e8f0",
				fontFamily: customFont,
			}}
		>
			{/* Tasto Back in basso a destra (leggermente spostato verso il centro come richiesto) */}
			<div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-[10%] xl:right-[15%] z-50">
				<button onClick={() => router.back()} className="flex items-center gap-3 px-6 py-4 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group cursor-pointer text-black">
					<ArrowLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform" strokeWidth={3} />
					<span className={`font-black uppercase tracking-wider ${textSizeClass}`}>{t("Back")}</span>
				</button>
			</div>

			{/* Togglone / Scroll On-Off Top */}
			<div className="relative w-full max-w-sm h-20 bg-white border-4 border-black rounded-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex cursor-pointer p-2 mb-12 shrink-0 select-none" onClick={() => setActiveTab((prev) => (prev === "profile" ? "settings" : "profile"))}>
				<div
					className={`absolute top-2 bottom-2 w-[calc(50%-0.5rem)] bg-pink-500 border-4 border-black rounded-full transition-transform duration-300 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.2)] ${activeTab === "settings" ? "translate-x-full" : "translate-x-0"
						}`}
				/>
				<div
					className={`relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl`}
					style={{ color: activeTab === "profile" ? "white" : "black" }}
				>
					<span>{t("Profile")}</span>
				</div>
				<div
					className={`relative flex-1 flex flex-col items-center justify-center z-10 transition-colors duration-300 font-black uppercase text-xl`}
					style={{ color: activeTab === "settings" ? "white" : "black" }}
				>
					<span>{t("Settings")}</span>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="w-full max-w-5xl relative z-10 flex flex-col items-center pb-24">
				{/* --- TAB PROFILE --- */}
				{activeTab === "profile" && (
					<div className="w-full max-w-4xl bg-[#ffd1dc] border-4 border-black rounded-[40px] shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-black">
						{/* Sezione Avatar */}
						<div className="flex flex-col items-center gap-6 md:w-1/2">
							<h2 className="font-black text-4xl uppercase tracking-widest text-center">{t("Customize")}</h2>

							{/* Avatar Preview */}
							<div
								className="w-40 h-40 border-[6px] border-black rounded-full flex items-center justify-center overflow-hidden transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-white shrink-0"
								style={{ backgroundColor: avatarColor }}
							>
								<Avatar className="w-full h-full rounded-none bg-transparent">
									<AvatarImage src="/avatars/shadcn.jpg" className="object-cover mix-blend-multiply" />
									<AvatarFallback className="bg-transparent font-black text-5xl">XD</AvatarFallback>
								</Avatar>
							</div>

							<Link href="/settings/avatar">
								<button className="bg-yellow-300 border-4 border-black px-8 py-4 font-black uppercase tracking-wider rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-yellow-400 transition-all text-xl mt-2">
									{t("Change Avatar")}
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
								<label className="font-black text-2xl uppercase flex items-center gap-2">
									<Paintbrush className="w-6 h-6" /> {t("Username")}
								</label>
								<input
									className="border-4 border-black rounded-2xl p-6 font-bold text-3xl uppercase outline-none focus:bg-pink-100 transition-colors w-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] placeholder:text-black/30"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter name..."
								/>
							</div>

							{/* Icon Background */}
							<div className="w-full flex flex-col gap-4">
								<label className="font-black text-2xl uppercase">{t("Icon Background")}</label>
								<div className="flex flex-wrap gap-4 justify-start">
									{COLORS.map((c) => (
										<button
											key={c}
											onClick={() => setAvatarColor(c)}
											className={`w-14 h-14 rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:scale-95 transition-all ${avatarColor === c ? "scale-110 ring-4 ring-black ring-offset-4 ring-offset-[#ffd1dc]" : "hover:scale-105"
												}`}
											style={{ backgroundColor: c }}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* --- TAB SETTINGS --- */}
				{activeTab === "settings" && (
					<div className="w-full bg-[#fdfbf7] border-4 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex overflow-hidden min-h-[500px] flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500 text-black">

						{/* Sidebar Helpler */}
						<div className="md:w-[250px] lg:w-[300px] bg-white border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-row md:flex-col gap-4 overflow-x-auto shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.05)] z-10 custom-scroll">
							<div className="hidden md:block mb-6">
								<h3 className="font-black text-3xl uppercase">{t("Menu")}</h3>
							</div>
							<NavButton icon={<Volume2 />} label={t("Audio")} active={activeSetting === "audio"} onClick={() => setActiveSetting("audio")} />
							<NavButton icon={<Type />} label={t("Font")} active={activeSetting === "font"} onClick={() => setActiveSetting("font")} />
							<NavButton icon={<Sun />} label={t("Theme")} active={activeSetting === "theme"} onClick={() => setActiveSetting("theme")} />
							<NavButton icon={<Wand2 />} label={t("Curse Mode")} active={activeSetting === "curse"} onClick={() => setActiveSetting("curse")} />
						</div>

						{/* Content Area (No Scroll) */}
						<div className="flex-1 p-4 sm:p-8 flex flex-col bg-transparent relative justify-center">

							{/* AUDIO SECTION */}
							{activeSetting === "audio" && (
								<div className="bg-[#b5c7f2] border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
									<h2 className="font-black text-4xl uppercase flex items-center gap-4">
										<Volume2 className="w-10 h-10" /> {t("Audio")}
									</h2>
									<div className="space-y-8">
										{/* Master */}
										<div className="flex flex-col gap-4">
											<label className="font-bold uppercase text-2xl flex justify-between">
												<span>{t("Generale")}</span>
												<span className="bg-white border-2 border-black rounded-lg px-3">{isCurseMode ? "***" : masterVolume}%</span>
											</label>
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
											<label className="font-bold uppercase text-2xl flex justify-between">
												<span>{t("Effetti Sonori")}</span>
												<span className="bg-white border-2 border-black rounded-lg px-3">{isCurseMode ? "***" : sfxVolume}%</span>
											</label>
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
										<Type className="w-10 h-10" /> {t("Font Options")}
									</h2>
									<div className="flex flex-col xl:flex-row gap-8">
										{/* Type */}
										<div className="flex-1 flex flex-col gap-4">
											<label className="font-bold uppercase text-2xl">{t("Style (Famiglia)")}</label>
											<div className="flex flex-col gap-3">
												<button
													onClick={() => setFontFamily("leggibile")}
													className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontFamily === "leggibile" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
												>
													{t("Leggibile")}
												</button>
												<button
													onClick={() => setFontFamily("simpatico")}
													className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontFamily === "simpatico" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
													style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}
												>
													{t("Simpatico")}
												</button>
												<button
													onClick={() => setFontFamily("creativo")}
													className={`text-left px-6 py-4 border-4 border-black rounded-xl font-bold text-xl uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-serif ${fontFamily === "creativo" ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white text-black hover:bg-gray-100"}`}
												>
													{t("Creativo")}
												</button>
											</div>
										</div>
										{/* Size */}
										<div className="flex-1 flex flex-col gap-4">
											<label className="font-bold uppercase text-2xl">{t("Dimensioni")}</label>
											<div className="flex gap-4">
												{(["S", "M", "L"] as const).map((sz) => (
													<button
														key={sz}
														onClick={() => setFontSize(sz)}
														className={`w-16 h-16 sm:w-20 sm:h-20 border-4 border-black rounded-full flex items-center justify-center font-black uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${fontSize === sz ? "bg-pink-500 text-white scale-110 shadow-none translate-x-1 translate-y-1" : "bg-white text-black hover:bg-gray-100"}`}
														style={{ fontSize: sz === "S" ? "1rem" : sz === "L" ? "2.5rem" : "1.5rem" }}
													>
														{t(sz)}
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
										<Sun className="w-10 h-10" /> {t("Appearance")}
									</h2>
									<div className="flex items-center gap-6 pb-4">
										<span className="font-bold uppercase text-2xl w-40">{isNightMode ? t("Night Mode") : t("Light Mode")}</span>
										{/* Mega switch custom for Theme */}
										<button
											onClick={() => setIsNightMode((p) => !p)}
											className={`relative w-28 h-12 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-1 transition-colors ${isNightMode ? "bg-indigo-900" : "bg-[#fce2c2]"}`}
										>
											<div
												className={`absolute top-1 bottom-1 w-8 bg-white border-2 border-black rounded-full transition-transform flex items-center justify-center ${isNightMode ? "translate-x-[64px]" : "translate-x-0"}`}
											>
												{isNightMode ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-black" />}
											</div>
										</button>
									</div>
								</div>
							)}

							{/* CURSE MODE SECTION */}
							{activeSetting === "curse" && (
								<div className="bg-red-400 border-4 border-black rounded-[2rem] p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
									<h2 className="font-black text-4xl uppercase flex items-center gap-4">
										<Wand2 className="w-10 h-10 text-black" /> {t("Cursed Mode")}
									</h2>
									<div className="flex items-center justify-between gap-6 pb-4 bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
										<div className="flex flex-col">
											<span className="font-bold uppercase text-2xl">{t("Enable Curse")}</span>
											<span className="font-bold opacity-50">{t("Replace all text with asterisks (*)")}</span>
										</div>
										<button
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
				)}
			</div>

			<style dangerouslySetInnerHTML={{
				__html: `
				.custom-scroll::-webkit-scrollbar {
					width: 14px;
					height: 14px;
				}
				.custom-scroll::-webkit-scrollbar-track {
					background: transparent;
					border-left: 4px solid black;
				}
				.custom-scroll::-webkit-scrollbar-thumb {
					background-color: #ffd1dc;
					border: 3px solid black;
					border-radius: 20px;
				}
			`}} />
		</div>
	);
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`flex items-center gap-3 px-6 py-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-yellow-300 transition-all font-black uppercase text-lg shrink-0 whitespace-nowrap ${active ? "bg-yellow-300 translate-x-1 translate-y-1 shadow-none" : "bg-white text-black"}`}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}
