"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const GAMES = [
{
id: "game-1",
title: "TRASHY QUIZ",
color: "bg-blue-400",
description: "Answer the most degenerate questions.",
},
{
id: "game-2",
title: "SPIN THE BOTTLE",
color: "bg-pink-400",
description: "Chaos ensues. Good luck.",
},
{
id: "game-3",
title: "NEVER HAVE I EVER",
color: "bg-green-400",
description: "Time to expose your friends.",
},
{
id: "game-4",
title: "DANCE BATTLE",
color: "bg-yellow-400",
description: "Show off your worst moves.",
}
];

export default function PlaySelectionPage() {
const params = useParams();
const roomId = params.id as string;
const router = useRouter();

const [currentIndex, setCurrentIndex] = useState(0);

const handleNext = () => {
setCurrentIndex((prev) => (prev + 1) % GAMES.length);
};

const handlePrev = () => {
setCurrentIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length);
};

return (
<div className="flex flex-col items-center justify-center min-h-[80vh] w-full mx-auto px-4 relative overflow-hidden">
{/* CLOSE BUTTON */}
<button 
onClick={() => router.back()}
className="absolute top-0 right-4 sm:top-4 sm:right-8 p-3 bg-red-400 border-4 border-black rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all z-40"
>
<X className="w-8 h-8 text-black" strokeWidth={3} />
</button>

<h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-black mb-8 text-center drop-shadow-[4px_4px_0_rgba(255,255,255,1)] z-40 relative">
Select Game
</h1>

{/* CAROUSEL CONTAINER */}
<div className="w-full relative flex flex-col items-center mt-4">
{/* Visual Track Area */}
<div className="relative flex justify-center items-center w-full max-w-[100vw] h-[350px] sm:h-[400px]">
{GAMES.map((game, idx) => {
const offset = idx - currentIndex;

let translateX = '0px';
let scale = 1;
let zIndex = 10;
let opacity = 1;

if (offset === 0) {
zIndex = 30;
translateX = '0px';
scale = 1;
opacity = 1;
} else if (offset === -1 || (currentIndex === 0 && idx === GAMES.length - 1)) {
zIndex = 20;
translateX = '-55%';
scale = 0.8;
opacity = 0.7;
} else if (offset === 1 || (currentIndex === GAMES.length - 1 && idx === 0)) {
zIndex = 20;
translateX = '55%';
scale = 0.8;
opacity = 0.7;
} else {
zIndex = 0;
translateX = offset > 0 ? '120%' : '-120%';
scale = 0.5;
opacity = 0;
}

return (
<div 
key={game.id}
onClick={() => offset !== 0 && setCurrentIndex(idx)}
className={`absolute w-[280px] h-[320px] sm:w-[350px] sm:h-[350px] ${game.color} border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col items-center justify-center p-6 group transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer`}
style={{ 
transform: `translateX(${translateX}) scale(${scale})`,
zIndex,
opacity
}}
>
<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

<h2 className="text-3xl sm:text-5xl font-black text-center text-black uppercase tracking-tighter leading-none mb-4 px-2">
{game.title}
</h2>
<p className="text-center text-black font-bold text-lg border-t-4 border-black pt-4 px-2 line-clamp-2">
{game.description}
</p>

{offset === 0 && (
<button className="mt-8 bg-white border-4 border-black px-8 py-3 text-xl sm:text-2xl font-black uppercase text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
START
</button>
)}
</div>
);
})}
</div>

{/* NAVIGATION ARROWS */}
<div className="flex gap-8 mt-12 relative z-40">
<button 
onClick={handlePrev}
className="p-4 bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
>
<ArrowLeft className="w-10 h-10 text-black" strokeWidth={3} />
</button>
<button 
onClick={handleNext}
className="p-4 bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
>
<ArrowRight className="w-10 h-10 text-black" strokeWidth={3} />
</button>
</div>

{/* INDICATORS */}
<div className="flex gap-3 mt-8 relative z-40">
{GAMES.map((_, idx) => (
<div 
key={idx} 
onClick={() => setCurrentIndex(idx)}
className={`h-4 cursor-pointer border-2 border-black transition-all ${idx === currentIndex ? 'w-12 bg-black' : 'w-4 bg-white hover:bg-gray-200'}`}
/>
))}
</div>
</div>
</div>
);
}
