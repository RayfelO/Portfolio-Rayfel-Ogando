import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Translations } from "../../i18n/translations";

interface NavigationIndexProps {
	t: Translations;
	lang: "en" | "es";
}

export const NavigationIndex: React.FC<NavigationIndexProps> = ({
	t,
	lang,
}) => {
	const lenis = useLenis();
	const [activeSections, setActiveSections] = useState<string[]>(["inicio"]);
	const intersectionMapRef = useRef<Record<string, boolean>>({});

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
		const map = intersectionMapRef.current;
		// Initialize map status
		for (const sec of sections) {
			map[sec.id] = sec.id === "inicio";
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					map[entry.target.id] = entry.isIntersecting;
				}

				const nextActive = sections
					.filter((sec) => map[sec.id])
					.map((sec) => sec.id);

				if (nextActive.length > 0) {
					setActiveSections((prev) => {
						const isSame =
							prev.length === nextActive.length &&
							prev.every((val, index) => val === nextActive[index]);
						return isSame ? prev : nextActive;
					});
				}
			},
			{
				rootMargin: "-120px 0px -45% 0px",
				threshold: 0,
			},
		);

		for (const sec of sections) {
			const el = document.getElementById(sec.id);
			if (el) {
				observer.observe(el);
			}
		}

		return () => {
			observer.disconnect();
		};
	}, [sections]);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			if (lenis) {
				lenis.scrollTo(element, { offset: -80 });
			} else {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	const indexTitle = lang === "es" ? "Índice" : "Index";

	return (
		<div className="flex flex-col gap-4 select-none">
			<span className="text-[11.5px] font-bold text-secondary uppercase tracking-widest pl-1 font-mono">
				{indexTitle}
			</span>
			<nav className="flex flex-col relative pl-4 border-l border-[var(--accent-brand)]/25">
				<div className="flex flex-col gap-4">
					{/* fallow-ignore-next-line complexity */}
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
								<div className="relative w-2 h-2 -ml-[20px] flex items-center justify-center flex-shrink-0">
									<motion.div
										animate={{
											scale: isActive ? 1.25 : 1,
											backgroundColor: isActive
												? "var(--accent-brand)"
												: "var(--bg-base)",
											borderColor: isActive
												? "var(--accent-brand)"
												: "var(--border-default)",
											boxShadow: isActive
												? "0 0 8px rgba(43, 69, 136, 0.65)"
												: "0 0 0px rgba(0, 0, 0, 0)",
										}}
										whileHover={
											!isActive ? { borderColor: "var(--text-secondary)" } : {}
										}
										transition={{
											type: "spring",
											stiffness: 300,
											damping: 25,
										}}
										className="w-2 h-2 rounded-full border"
									/>
								</div>
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
