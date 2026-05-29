import type { Metadata } from "next";
import { Caveat, Inter, VT323 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
			<body className="min-h-full flex flex-col font-[family-name:var(--font-pixel)]">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>{children}</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
