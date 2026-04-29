import Image from "next/image";
import Button from "../components/button";

export default function Home() {
	return (
		<main className="flex flex-col h-screen w-screen items-center justify-center bg-[url('/title.jpg')] bg-cover bg-center overflow-hidden">
			<div className="flex flex-col items-center justify-center relative w-full max-w-[1400px] px-8 z-10 transform -translate-x-4 md:-translate-x-8">
				<div className="relative w-full flex justify-center">
					<Image
						src="/toptitle.svg"
						alt="Title"
						width={800}
						height={300}
						className="animate-breathe w-full drop-shadow-xl z-100"
						style={{ height: "auto" }}
						priority
					/>
					<Image
						src="/bottomtitle.svg"
						alt="now with games too"
						width={200}
						height={100}
						className="absolute top-[50%] sm:top-[55%] left-[55%] sm:left-[55%] -translate-x-1/2 animate-rock w-[220px] sm:w-[266px] drop-shadow-xl z-[150]"
						priority
					/>
				</div>
			</div>

			<div className="-mt-20 sm:-mt-32 z-40 relative">
				<Button text="Get in" />
			</div>
		</main>
	);
}
