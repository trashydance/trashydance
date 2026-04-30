"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";

export default function StatsPage() {
	const params = useParams();
	const roomId = params.id as string;

	return (
		<>
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex items-center gap-4">
				<Link href={`/rooms/${roomId}`}>
					<button className="w-14 h-14 sm:w-16 sm:h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none hover:bg-gray-100 transition-all cursor-pointer group">
						<ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 text-black group-hover:-translate-x-1 transition-transform" strokeWidth={4} />
					</button>
				</Link>
			</div>

			<div className="mt-20 mb-8 sm:mb-12 text-center md:text-left pr-4">
				<h1 className="font-black text-4xl sm:text-6xl uppercase tracking-widest text-black">Stats</h1>
				<p className="font-bold text-xl sm:text-3xl mt-2 text-black/60 uppercase">Cloud rankings</p>
			</div>

			<div className="flex flex-col gap-6">
				<div className="bg-yellow-300 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center gap-4">
					<Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-black" strokeWidth={2.5} />
					<div className="flex flex-col">
						<span className="font-black text-2xl uppercase text-black">WIP</span>
						<span className="font-bold text-lg text-black/70 uppercase">Coming soon</span>
					</div>
				</div>
			</div>
		</>
	);
}
