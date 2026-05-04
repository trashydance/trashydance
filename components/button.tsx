"use client";

import Image from "next/image";

export default function Button({ text }: { text: string }) {
	return (
		<a
			href="/rooms"
			className="block relative isolate w-72 h-48 text-gray-800 transition-all hover:brightness-105"
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
				<span className="z-10 mt-8 text-5xl font-bold font-[family-name:var(--font-pixel)]">
					{text}
				</span>
			</div>
		</a>
	);
}
