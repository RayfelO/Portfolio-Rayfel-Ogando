import { GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { educations } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface EducationCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
}

export const EducationCard: React.FC<EducationCardProps> = ({
	id,
	t,
	lang,
}) => {
	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...cardHoverProps}
			className="bento-card bento-col-2 flex flex-col gap-4 justify-between overflow-visible"
		>
			{/* Header */}
			<div className="select-none flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
				<h2 className="text-[13px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.education}
				</h2>
				<GraduationCap size={15} className="text-secondary stroke-[2.5]" />
			</div>

			{/* Timeline Container */}
			<div className="relative flex-1 pl-4 border-l border-[var(--accent-brand)]/25 ml-2 flex flex-col gap-6 overflow-visible">
				{educations.map((edu) => {
					const degree = lang === "es" ? edu.degreeEs : edu.degreeEn;
					const period = lang === "es" ? edu.periodEs : edu.periodEn;
					const details = lang === "es" ? edu.detailsEs : edu.detailsEn;

					// Check if current or active based on years (e.g. INTEC ends in 2026, which is current)
					const isCurrent =
						period.toLowerCase().includes("actualidad") ||
						period.includes("2026");

					return (
						<div key={edu.id} className="relative group">
							{/* Timeline Indicator Dot */}
							<span className="absolute -left-[23px] top-1.5 flex h-3.5 w-3.5 items-center justify-center">
								{isCurrent ? (
									<>
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-blue)] opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-blue)] shadow-[0_0_6px_rgba(43,69,136,0.5)]" />
									</>
								) : (
									<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--border-hover)] shadow-[0_0_4px_rgba(43,69,136,0.3)]" />
								)}
							</span>

							{/* Education Header */}
							<div className="flex flex-col gap-1">
								<span className="text-[12px] font-mono text-secondary">
									{period}
								</span>
								<h3 className="text-[15.5px] font-semibold text-primary">
									{degree}
								</h3>

								<div className="text-[13.5px] text-secondary font-medium italic">
									<span>{edu.institution}</span>
								</div>
							</div>

							{/* Details Paragraph */}
							<p className="mt-2 text-[13px] text-secondary leading-relaxed">
								{details}
							</p>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};
