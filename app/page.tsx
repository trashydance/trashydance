import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COPYRIGHT_NOTICE } from "@/lib/constants";

const TAGS = ["Realtime · WebSocket", "2FA + 42 OAuth", "Mobile-first"];

export default function Home() {
	return (
		<div className="flex h-svh w-full flex-col overflow-hidden bg-background">
			{/* header */}
			<header className="border-b-2 border-ink">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4">
					<Link href="/" className="flex items-center gap-3">
						<span className="flex size-10 items-center justify-center border-2 border-ink bg-lime font-display text-sm text-ink shadow-brutal-sm">
							TD
						</span>
						<span className="font-display text-lg uppercase tracking-tight">
							<span className="text-ink">Trashy</span>
							<span className="text-cobalt">Dance</span>
						</span>
					</Link>
					<Button asChild variant="neutral">
						<Link href="/login">Log in</Link>
					</Button>
				</div>
			</header>

			{/* hero */}
			<main className="flex min-h-0 flex-1 items-center">
				<div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_auto]">
					<div className="flex flex-col items-start gap-6 lg:gap-8">
						<h1 className="max-w-xl text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
							Direct chat for the people you actually{" "}
							<span className="inline-block border-2 border-ink bg-lime px-3">
								talk to.
							</span>
						</h1>

						<p className="max-w-md text-lg text-muted-foreground">
							No groups. No feed. No drama. Just 1-to-1 messages with the
							classmates you follow — live, fast, and forgettable.
						</p>

						<div className="flex w-full flex-wrap items-center gap-6 sm:w-auto">
							<Button asChild size="gigantic" className="w-full sm:w-auto">
								<Link href="/home">
									Get in
									<ArrowRight className="!size-5" aria-hidden />
								</Link>
							</Button>
							<Link
								href="/register"
								className="font-display text-sm uppercase underline underline-offset-4 hover:text-cobalt"
							>
								New here? Sign up →
							</Link>
						</div>

						<ul className="flex flex-wrap gap-3">
							{TAGS.map((tag) => (
								<li
									key={tag}
									className="border-2 border-ink bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide"
								>
									{tag}
								</li>
							))}
						</ul>
					</div>

					<Image
						src="/chat-mock.png"
						alt="Preview of a 1-to-1 chat with @fmartusc"
						width={760}
						height={549}
						className="hidden w-full max-w-md lg:block"
						priority
					/>
				</div>
			</main>

			{/* footer */}
			<footer className="border-t-2 border-ink">
				<div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
					<p className="font-display text-xs uppercase">{COPYRIGHT_NOTICE}</p>
					<nav className="flex gap-5 text-sm">
						<Link href="/privacy" className="hover:underline">
							Privacy
						</Link>
						<Link href="/terms" className="hover:underline">
							Terms
						</Link>
					</nav>
				</div>
			</footer>
		</div>
	);
}
