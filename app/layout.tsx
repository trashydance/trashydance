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
	title: {
		default: "TrashyDance",
		template: "%s | TrashyDance",
	},
	description: "A secure and fun 1-to-1 chat application, now with games too!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full",
				"antialiased",
				fontDisplay.variable,
				"font-sans",
				fontSans.variable,
			)}
		>
			<body className="min-h-full flex flex-col font-sans">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
