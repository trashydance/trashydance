import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="flex flex-col h-svh w-full overflow-hidden items-center justify-center bg-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-5 pt-[70px] prose-h4:xl:text-2xl prose-h4:lg:text-xl prose-h4:text-lg">
			<div className="flex flex-col items-center justify-center relative w-full">
				<Image
					src="/toptitle.svg"
					alt="Title"
					width={1800}
					height={600}
					className="animate-breathe w-full drop-shadow-xl"
					style={{ height: "auto" }}
					priority
				/>
			</div>

			<div className="-mt-60 z-40 pl-8">
				<Button asChild size="gigantic">
					<Link href="/home">Get in</Link>
				</Button>
			</div>
		</main>
	);
}
