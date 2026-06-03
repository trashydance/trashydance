"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>("light");

	useEffect(() => {
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setThemeState(stored);
		} else if (matchMedia("(prefers-color-scheme: dark)").matches) {
			setThemeState("dark");
		}
	}, []);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
		localStorage.setItem("theme", t);
		if (t === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	return { theme, setTheme, toggleTheme };
}
