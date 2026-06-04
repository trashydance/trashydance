"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function systemPrefersDark(): boolean {
	return matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(t: Theme) {
	const dark = t === "dark" || (t === "system" && systemPrefersDark());
	document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>("system");

	useEffect(() => {
		const stored = localStorage.getItem("theme") as Theme | null;
		setThemeState(stored === "light" || stored === "dark" ? stored : "system");
	}, []);

	// segue il sistema quando theme === "system"
	useEffect(() => {
		if (theme !== "system") return;
		const mq = matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [theme]);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
		if (t === "system") {
			localStorage.removeItem("theme");
		} else {
			localStorage.setItem("theme", t);
		}
		applyTheme(t);
	}, []);

	const toggleTheme = useCallback(() => {
		const dark =
			theme === "dark" || (theme === "system" && systemPrefersDark());
		setTheme(dark ? "light" : "dark");
	}, [theme, setTheme]);

	return { theme, setTheme, toggleTheme };
}
