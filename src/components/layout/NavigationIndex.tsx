import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { Translations } from "../../i18n/translations";

interface NavigationIndexProps {
	t: Translations;
	lang: "en" | "es";
}

export const NavigationIndex: React.FC<NavigationIndexProps> = ({
	t,
	lang,
}) => {
	const [activeSections, setActiveSections] = useState<string[]>(["inicio"]);

	const sections = useMemo(
		() => [
			{ id: "inicio", label: t.sections.home },
			{ id: "tecnologias", label: t.sections.stack },
			{ id: "certificaciones", label: t.sections.certifications },
			{ id: "proyectos", label: t.sections.projects },
			{ id: "experiencia", label: t.sections.experience },
			{ id: "educacion", label: t.sections.education },
		],
		[t],
	);

	useEffect(() => {
		const handleScroll = () => {
			const visibleSections: string[] = [];

			for (const sec of sections) {
				const element = document.getElementById(sec.id);
				if (element) {
					const rect = element.getBoundingClientRect();
					// A section is active if it lies in the viewport's active area (top in the upper 55%, bottom below header)
					if (rect.top < window.innerHeight * 0.55 && rect.bottom > 130) {
						visibleSections.push(sec.id);
					}
				}
			}

			if (visibleSections.length === 0) {
				// Fallback to the single closest section to the active viewport line
				let closestSection = "inicio";
				let minDistance = Number.POSITIVE_INFINITY;

				for (const sec of sections) {
					const element = document.getElementById(sec.id);
					if (element) {
						const rect = element.getBoundingClientRect();
						const distance = Math.abs(rect.top - 120);
						if (distance < minDistance) {
							minDistance = distance;
							closestSection = sec.id;
						}
					}
				}
				setActiveSections([closestSection]);
			} else {
				setActiveSections(visibleSections);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		// Run once on mount to capture initial state
		handleScroll();

		// Fallback to trigger scroll spy on mount after brief timeout (DOM rendering)
		const timer = setTimeout(handleScroll, 100);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			clearTimeout(timer);
		};
	}, [sections]);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	const indexTitle = lang === "es" ? "Índice" : "Index";

	return (
		<div className="flex flex-col gap-4 select-none">
			<span className="text-[11.5px] font-bold text-secondary uppercase tracking-widest pl-1 font-mono">
				{indexTitle}
			</span>
			<nav className="flex flex-col relative pl-4 border-l border-[var(--border-default)]">
				<div className="flex flex-col gap-4">
					{sections.map((sec) => {
						const isActive = activeSections.includes(sec.id);
						return (
							<button
								key={sec.id}
								type="button"
								onClick={() => scrollToSection(sec.id)}
								className="group flex items-center gap-3.5 text-left cursor-pointer focus:outline-none"
							>
								{/* Bullet Dot indicator centered on the left border */}
								<div
									className={`w-2 h-2 rounded-full border transition-all duration-300 -ml-[20px] flex-shrink-0 ${
										isActive
											? "bg-[var(--text-primary)] border-[var(--text-primary)] scale-125 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
											: "bg-[var(--bg-base)] border-[var(--border-default)] group-hover:border-[var(--text-secondary)]"
									}`}
								/>
								{/* Label text */}
								<span
									className={`text-[12.5px] font-medium tracking-tight transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary ${
										isActive
											? "text-primary font-semibold"
											: "text-secondary font-normal"
									}`}
								>
									{sec.label}
								</span>
							</button>
						);
					})}
				</div>
			</nav>
		</div>
	);
};
