import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RoomsButton() {
	return (
		<div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-[10%] xl:right-[15%] z-50">
			<Link
				href="/rooms"
				className="flex items-center gap-3 px-6 py-4 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group cursor-pointer text-black"
			>
				<ArrowLeft
					className="w-8 h-8 group-hover:-translate-x-2 transition-transform"
					strokeWidth={3}
				/>
				<span className="font-black uppercase tracking-wider">Rooms</span>
			</Link>
		</div>
	);
}
