"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { type Language, translations } from "@/lib/i18n/dictionaries";

interface I18nContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: keyof typeof translations.en) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageRaw] = useState<Language>("en");

	useEffect(() => {
		const saved = localStorage.getItem("trashydance-lang") as Language;
		if (saved && (saved === "en" || saved === "it" || saved === "bg")) {
			setLanguageRaw(saved);
		} else {
			// Try browser locale detect
			const browserLang = navigator.language.split("-")[0];
			if (browserLang === "it") {
				setLanguageRaw("it");
			} else if (browserLang === "bg") {
				setLanguageRaw("bg");
			}
		}
	}, []);

	const setLanguage = useCallback((lang: Language) => {
		localStorage.setItem("trashydance-lang", lang);
		setLanguageRaw(lang);
	}, []);

	const t = useCallback(
		(key: keyof typeof translations.en): string => {
			const dict = translations[language] || translations.en;
			return dict[key] || translations.en[key] || String(key);
		},
		[language],
	);

	return (
		<I18nContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		return {
			language: "en" as Language,
			setLanguage: () => {},
			t: (key: keyof typeof translations.en) => {
				return translations.en[key] || String(key);
			},
		};
	}
	return context;
}
