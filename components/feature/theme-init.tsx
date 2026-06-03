"use client";

import { useEffect } from "react";

export function ThemeInit() {
	useEffect(() => {
		const stored = localStorage.getItem("theme");
		if (
			stored === "dark" ||
			(!stored && matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			document.documentElement.classList.add("dark");
		}
	}, []);

	return null;
}
