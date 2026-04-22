"use client";

import { useState } from "react";
import Image from "next/image";

export default function Button({ text }: { text: string }) {
	const [isClicked, setIsClicked] = useState(false);

	return (
		<button
			onClick={() => setIsClicked(!isClicked)}
			className={`relative isolate w-48 h-32 text-gray-800 transition-all active:scale-95 ${isClicked ? "brightness-110 scale-105" : "hover:brightness-105"
				}`}
		>
			<div className="relative flex w-full h-full items-center justify-center animate-unstabile">
				<Image
					src="/cloud.png"
					alt="Cloud background"
					fill
					sizes="192px"
					priority
					className="object-contain drop-shadow-md -z-10"
				/>
				<span className="z-10 mt-6 text-3xl font-bold font-[family-name:var(--font-pixel)]">
					{isClicked ? "Works" : text}
				</span>
			</div>
		</button>
	);
}