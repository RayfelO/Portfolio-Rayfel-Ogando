export type Theme = "dark" | "light";

const VALID_THEMES = new Set<Theme>(["dark", "light"]);

export const getInitialTheme = (): Theme => {
	if (typeof window === "undefined") return "dark";
	const stored = window.localStorage.getItem("theme");
	if (VALID_THEMES.has(stored as Theme)) return stored as Theme;
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
};

export const applyTheme = (theme: Theme) => {
	if (typeof window !== "undefined") {
		const root = window.document.documentElement;
		root.classList.add("theme-switching");
		root.setAttribute("data-theme", theme);
		window.localStorage.setItem("theme", theme);
		setTimeout(() => {
			root.classList.remove("theme-switching");
		}, 200);
	}
};
