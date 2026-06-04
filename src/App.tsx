import type React from "react";
import { useEffect, useState } from "react";
import { ContactModal } from "./components/ContactModal";
import { AvatarCard } from "./components/cards/AvatarCard";
import { CertificationsCard } from "./components/cards/CertificationsCard";
import { ContactCard } from "./components/cards/ContactCard";
import { EducationCard } from "./components/cards/EducationCard";
import { ExperienceCard } from "./components/cards/ExperienceCard";
import { HeroCard } from "./components/cards/HeroCard";
import { ProjectsCard } from "./components/cards/ProjectsCard";
import { TechStackCard } from "./components/cards/TechStackCard";
import { BentoGrid } from "./components/layout/BentoGrid";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { NavigationIndex } from "./components/layout/NavigationIndex";
import { translations } from "./i18n/translations";
import { initAnalytics, track } from "./lib/analytics";
import { applyTheme, getInitialTheme, type Theme } from "./lib/theme";

const App: React.FC = () => {
	// Theme and Language State
	const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
	const [lang, setLang] = useState<"en" | "es">("es");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Initialize PostHog and apply current theme on load
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

	// Get active translations
	const t = translations[lang];

	return (
		<div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col justify-between">
			<div className="w-full">
				{/* Navigation Header */}
				<Header
					lang={lang}
					toggleLang={toggleLang}
					theme={theme}
					toggleTheme={toggleTheme}
				/>

				{/* Main Layout Container with Relative Grid and Sticky Sidebar */}
				<div className="w-full max-w-[1100px] mx-auto relative">
					{/* Bento Grid Layout */}
					<BentoGrid>
						{/* Row 1: Avatar (col-1), Hero (col-2) & Contact (col-1) */}
						<AvatarCard id="inicio" />
						<HeroCard t={t} />
						<ContactCard t={t} onOpenModal={() => setIsModalOpen(true)} />

						{/* Row 2: TechStack (col-2) & Certifications (col-2) */}
						<TechStackCard id="tecnologias" t={t} lang={lang} />
						<CertificationsCard id="certificaciones" t={t} lang={lang} />

						{/* Row 3: Projects conmutable tabbed (col-4) */}
						<ProjectsCard id="proyectos" t={t} lang={lang} />

						{/* Row 4: Work Experience (col-2) & Education (col-2) */}
						<ExperienceCard id="experiencia" t={t} lang={lang} />
						<EducationCard id="educacion" t={t} lang={lang} />
					</BentoGrid>

					{/* Sticky Navigation Index floating to the right (only visible on wide screens) */}
					<aside className="hidden min-[1380px]:block absolute left-[calc(100%+24px)] top-0 h-full w-[160px]">
						<div className="sticky top-28">
							<NavigationIndex t={t} lang={lang} />
						</div>
					</aside>
				</div>
			</div>

			{/* Footer copyright */}
			<Footer lang={lang} />

			{/* Pop-up Contact Form Modal */}
			<ContactModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				t={t}
			/>
		</div>
	);
};

export default App;
