import type { Metadata } from "next";
import { Caveat, Inter, VT323 } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Font for headings (VT323)
const fontHeading = VT323({
	weight: "400",
	variable: "--font-heading",
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
			className={cn(
				"h-full",
				"antialiased",
				fontHeading.variable,
				fontCalligrafico.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<head>
				<script src="/theme-init.js" />
			</head>
			<body className="min-h-full flex flex-col font-[family-name:var(--font-pixel)]">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
