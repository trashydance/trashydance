"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SettingsPage() {
	const params = useParams();
	const roomId = params.id as string;

	return (
		<>
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex items-center gap-4">
				<Link
					href={`/rooms/${roomId}`}
					className="w-14 h-14 sm:w-16 sm:h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none hover:bg-gray-100 transition-all cursor-pointer group"
				>
					<ArrowLeft
						className="w-6 h-6 sm:w-8 sm:h-8 text-black group-hover:-translate-x-1 transition-transform"
						strokeWidth={4}
					/>
				</Link>
			</div>

			<div className="mt-20 mb-8 sm:mb-12 text-center md:text-left pr-4">
				<h1 className="font-black text-4xl sm:text-6xl uppercase tracking-widest text-black">
					Settings
				</h1>
				<p className="font-bold text-xl sm:text-3xl mt-2 text-black/60 uppercase">
					Configure your cloud
				</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
					<h2 className="font-black text-2xl uppercase mb-4 text-black">
						Room Options
					</h2>
					<p className="font-bold text-lg text-black/70">
						WIP: No settings available yet.
					</p>
				</div>
			</div>
		</>
	);
}
