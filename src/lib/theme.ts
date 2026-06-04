export type Theme = "dark" | "light";

export const getInitialTheme = (): Theme => {
	if (typeof window !== "undefined" && window.localStorage) {
		const stored = window.localStorage.getItem("theme") as Theme | null;
		if (stored === "dark" || stored === "light") {
			return stored;
		}
		const userMedia = window.matchMedia("(prefers-color-scheme: light)");
		if (userMedia.matches) {
			return "light";
		}
	}
	return "dark"; // Default is dark mode
};

export const applyTheme = (theme: Theme) => {
	if (typeof window !== "undefined") {
		const root = window.document.documentElement;
		root.setAttribute("data-theme", theme);
		window.localStorage.setItem("theme", theme);
	}
};
