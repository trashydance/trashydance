import type { Metadata } from "next";
import { Archivo_Black, Hind } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fontSans = Hind({
	weight: ["400", "500", "600", "700"],
	variable: "--font-hind",
	subsets: ["latin"],
});

const fontDisplay = Archivo_Black({
	weight: "400",
	variable: "--font-archivo-black",
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
			className={cn(
				"h-full",
				"antialiased",
				fontDisplay.variable,
				"font-sans",
				fontSans.variable,
			)}
		>
			<head>
				<script src="/theme-init.js" />
			</head>
			<body className="min-h-full flex flex-col font-sans">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
