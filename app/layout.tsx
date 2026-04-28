import type { Metadata } from "next";
import { Caveat, VT323 } from "next/font/google"; //font import
import "./globals.css";

// Font pixel
const fontPixel = VT323({
	weight: "400",
	variable: "--font-pixel",
	subsets: ["latin"],
});

// Font calligrafic
const fontCalligrafico = Caveat({
	variable: "--font-calligrafic",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ChatSimulator (really good one)",
	description: "Really good chat simulator, now with games too!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			// 4. Inserisci le variabili CSS dei font nel tag HTML
			className={`${fontPixel.variable} ${fontCalligrafico.variable} h-full antialiased`}
		>
			{/* 5. Imposta un font di default per tutta l'app (es. il font pixelato) */}
			<body
				className="min-h-full flex flex-col font-[family-name:var(--font-pixel)]"
				suppressHydrationWarning
			>
				{children}
			</body>
		</html>
	);
}
