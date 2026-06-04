import { Moon, Sun } from "lucide-react";
import type React from "react";
import { track } from "../../lib/analytics";
import type { Theme } from "../../lib/theme";

interface HeaderProps {
	lang: "en" | "es";
	toggleLang: () => void;
	theme: Theme;
	toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
	lang,
	toggleLang,
	theme,
	toggleTheme,
}) => {
	const handleLangClick = () => {
		toggleLang();
		const nextLang = lang === "en" ? "es" : "en";
		track.languageChanged(nextLang);
	};

	const handleThemeClick = () => {
		toggleTheme();
		const nextTheme = theme === "dark" ? "light" : "dark";
		track.themeChanged(nextTheme);
	};

	return (
		<header className="w-full max-w-[1100px] mx-auto py-6 px-4 flex justify-between items-center select-none">
			{/* Minimalist Logo */}
			<div className="flex items-center gap-2">
				<span className="font-mono text-[13px] font-semibold tracking-wider text-primary bg-[var(--bg-subtle)] px-2.5 py-1.5 rounded-md border border-[var(--border-default)]">
					RO
				</span>
				<span className="text-[12px] font-mono tracking-tight text-secondary hidden sm:inline-block">
					rayfel.dev
				</span>
			</div>

			{/* Toggles */}
			<div className="flex items-center gap-3">
				{/* ES / EN Toggle Button */}
				<button
					type="button"
					onClick={handleLangClick}
					className="font-mono text-[11px] font-semibold px-3 py-2 rounded-md bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-secondary hover:text-primary transition-all duration-150 cursor-pointer"
				>
					{lang === "en" ? "ES" : "EN"}
				</button>

				{/* Theme Toggle Button */}
				<button
					type="button"
					onClick={handleThemeClick}
					aria-label="Toggle theme"
					className="p-2 rounded-md bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-secondary hover:text-primary transition-all duration-150 cursor-pointer flex items-center justify-center"
				>
					{theme === "dark" ? (
						<Sun size={14} className="stroke-[2.5]" />
					) : (
						<Moon size={14} className="stroke-[2.5]" />
					)}
				</button>
			</div>
		</header>
	);
};
