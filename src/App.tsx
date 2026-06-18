import { ReactLenis } from "lenis/react";
import type React from "react";
import { useEffect, useState } from "react";
import "lenis/dist/lenis.css";
import { ContactModal } from "./components/ContactModal";
import { CustomCursor } from "./components/CustomCursor";
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
							<AvatarCard
								id="inicio"
								lang={lang}
								className="order-1 min-[900px]:order-1"
							/>
							<HeroCard t={t} className="order-2 min-[900px]:order-2" />
							<ContactCard
								t={t}
								lang={lang}
								onOpenModal={() => setIsModalOpen(true)}
								className="order-3 min-[900px]:order-3"
							/>

							{/* Row 2: TechStack (col-2) & Certifications (col-2) */}
							<TechStackCard
								id="tecnologias"
								t={t}
								lang={lang}
								className="order-4 min-[900px]:order-4"
							/>
							<CertificationsCard
								id="certificaciones"
								t={t}
								lang={lang}
								className="order-8 min-[900px]:order-5"
							/>

							{/* Row 3: Projects conmutable tabbed (col-4) */}
							<ProjectsCard
								id="proyectos"
								t={t}
								lang={lang}
								className="order-5 min-[900px]:order-6"
							/>

							{/* Row 4: Work Experience (col-2) & Education (col-2) */}
							<ExperienceCard
								id="experiencia"
								t={t}
								lang={lang}
								className="order-6 min-[900px]:order-7"
							/>
							<EducationCard
								id="educacion"
								t={t}
								lang={lang}
								className="order-7 min-[900px]:order-8"
							/>
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
		</ReactLenis>
	);
};

export default App;
