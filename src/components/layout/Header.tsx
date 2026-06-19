import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { track } from "../../lib/analytics";
import type { Theme } from "../../lib/theme";

interface LangToggleProps {
	lang: "en" | "es";
	onClick: () => void;
}

const LangToggle: React.FC<LangToggleProps> = ({ lang, onClick }) => (
	<motion.button
		whileHover={{ scale: 1.05 }}
		whileTap={{ scale: 0.95 }}
		transition={{ type: "spring", stiffness: 450, damping: 20 }}
		type="button"
		onClick={onClick}
		className="min-h-[44px] min-w-[44px] font-mono text-[11px] font-semibold px-3 py-2 rounded-md bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-secondary hover:text-primary transition-all duration-150 cursor-pointer overflow-hidden"
	>
		<AnimatePresence mode="wait">
			<motion.span
				key={lang}
				initial={{ opacity: 0, y: -2 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 2 }}
				transition={{ duration: 0.12 }}
				className="inline-block"
			>
				{lang === "en" ? "ES" : "EN"}
			</motion.span>
		</AnimatePresence>
	</motion.button>
);

interface ThemeToggleProps {
	theme: Theme;
	onClick: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onClick }) => (
	<motion.button
		whileHover={{ scale: 1.05 }}
		whileTap={{ scale: 0.95 }}
		transition={{ type: "spring", stiffness: 450, damping: 20 }}
		type="button"
		onClick={onClick}
		aria-label="Toggle theme"
		className="min-h-[44px] min-w-[44px] p-2 rounded-md bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-secondary hover:text-primary transition-all duration-150 cursor-pointer flex items-center justify-center overflow-hidden"
	>
		<AnimatePresence mode="wait">
			<motion.div
				key={theme}
				initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
				animate={{ opacity: 1, rotate: 0, scale: 1 }}
				exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
				transition={{ duration: 0.15, ease: "easeOut" }}
				className="flex items-center justify-center"
			>
				{theme === "dark" ? (
					<Sun size={14} className="stroke-[2.5]" />
				) : (
					<Moon size={14} className="stroke-[2.5]" />
				)}
			</motion.div>
		</AnimatePresence>
	</motion.button>
);

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
		track.languageChanged(lang === "en" ? "es" : "en");
	};

	const handleThemeClick = () => {
		toggleTheme();
		track.themeChanged(theme === "dark" ? "light" : "dark");
	};

	return (
		<header className="sticky top-0 z-40 w-full max-w-[1100px] mx-auto py-4 sm:py-6 px-4 flex justify-between items-center select-none backdrop-blur-[10px] bg-[var(--bg-base)]/80">
			<div className="flex items-center gap-2">
				<img
					src="/vite.svg"
					alt="Logo"
					className="w-6 h-6 object-contain select-none flex-shrink-0"
				/>
				<span className="text-[12px] font-mono tracking-tight text-secondary hidden sm:inline-block">
					rayfelo.dev
				</span>
			</div>

			<div className="flex items-center gap-3">
				<LangToggle lang={lang} onClick={handleLangClick} />
				<ThemeToggle theme={theme} onClick={handleThemeClick} />
			</div>
		</header>
	);
};
