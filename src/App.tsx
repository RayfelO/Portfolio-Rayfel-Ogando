import { ReactLenis } from "lenis/react";
import type React from "react";
import { useEffect, useState } from "react";
import "lenis/dist/lenis.css";
import { ContactModal } from "./components/ContactModal";
import { CustomCursor } from "./components/CustomCursor";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { PortfolioLayout } from "./components/layout/PortfolioLayout";
import { translations } from "./i18n/translations";
import { initAnalytics, track } from "./lib/analytics";
import { applyTheme, getInitialTheme, type Theme } from "./lib/theme";

const App: React.FC = () => {
	const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
	const [lang, setLang] = useState<"en" | "es">("es");
	const [isModalOpen, setIsModalOpen] = useState(false);
	useEffect(() => {
		initAnalytics();
		applyTheme(theme);
		track.portfolioViewed();
	}, [theme]);
	const toggleTheme = () => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			applyTheme(next);
			return next;
		});
	};
	const toggleLang = () => {
		setLang((prev) => (prev === "en" ? "es" : "en"));
	};
	const t = translations[lang];
	return (
		<ReactLenis
			root
			options={{
				lerp: 0.08,
				anchors: { offset: -80 },
				smoothWheel: true,
				allowNestedScroll: true,
			}}
		>
			<div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col justify-between">
				<CustomCursor />
				<div className="w-full">
					<Header
						lang={lang}
						toggleLang={toggleLang}
						theme={theme}
						toggleTheme={toggleTheme}
					/>
					<PortfolioLayout
						t={t}
						lang={lang}
						onOpenModal={() => setIsModalOpen(true)}
					/>
				</div>
				<Footer lang={lang} />
				<ContactModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					t={t}
				/>
			</div>
		</ReactLenis>
	);
};

export default App;
