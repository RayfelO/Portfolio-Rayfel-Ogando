import type React from "react";
import type { Translations } from "../../i18n/translations";
import { NavButton } from "./NavButton";
import { getNavigationSections } from "./navigationSections";
import { useActiveSections } from "./useActiveSections";
import { useSmoothScroll } from "./useSmoothScroll";

interface NavigationIndexProps {
	t: Translations;
	lang: "en" | "es";
}

export const NavigationIndex: React.FC<NavigationIndexProps> = ({
	t,
	lang,
}) => {
	const sections = getNavigationSections(t);
	const activeSections = useActiveSections(sections);
	const scrollToSection = useSmoothScroll();
	const indexTitle = lang === "es" ? "Índice" : "Index";

	return (
		<div className="flex flex-col gap-4 select-none">
			<span className="text-[11.5px] font-bold text-secondary uppercase tracking-widest pl-1 font-mono">
				{indexTitle}
			</span>
			<nav className="flex flex-col relative pl-4 border-l border-[var(--accent-brand)]/25">
				<div className="flex flex-col gap-4">
					{sections.map((sec) => (
						<NavButton
							key={sec.id}
							id={sec.id}
							label={sec.label}
							isActive={activeSections.includes(sec.id)}
							onClick={scrollToSection}
						/>
					))}
				</div>
			</nav>
		</div>
	);
};
