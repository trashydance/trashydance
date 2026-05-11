import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div
			className={`min-h-screen relative overflow-hidden transition-colors duration-500 flex flex-col items-center py-12 px-4 sm:px-8`}
			style={{
				backgroundColor: "#e2e8f0",
			}}
		>
			{children}
		</div>
	);
}
