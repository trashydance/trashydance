import type { Metadata } from "next";
import { Caveat, VT323 } from "next/font/google";
import "./globals.css";

const fontPixel = VT323({
	weight: "400",
	variable: "--font-pixel",
	subsets: ["latin"],
});

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
			className={`${fontPixel.variable} ${fontCalligrafico.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-[family-name:var(--font-pixel)]">
				{children}
			</body>
		</html>
	);
}
