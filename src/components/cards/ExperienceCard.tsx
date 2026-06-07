import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { experiences } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface ExperienceCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
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
					{t.sections.experience}
				</h2>
				<Briefcase size={14} className="text-secondary stroke-[2.5]" />
			</div>

			{/* Timeline Container */}
			<div className="relative flex-1 pl-4 border-l border-[var(--accent-brand)]/25 ml-2 flex flex-col gap-8 overflow-visible">
				{experiences.map((exp) => {
					const location = lang === "es" ? exp.locationEs : exp.locationEn;
					const isCurrent = exp.roles.some((r) => r.current);

					return (
						<div key={exp.id} className="relative group flex flex-col gap-3">
							{/* Timeline Indicator Dot for the Company */}
							<span className="absolute -left-[23px] top-1 flex h-3.5 w-3.5 items-center justify-center select-none">
								{isCurrent ? (
									<>
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-green)] opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-green)] shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
									</>
								) : (
									<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--border-hover)] shadow-[0_0_4px_rgba(74,222,128,0.3)]" />
								)}
							</span>

							{/* Company Header */}
							<div className="flex flex-col">
								<h3 className="text-[15.5px] font-semibold text-primary">
									{exp.company}
								</h3>
								<span className="text-[12.5px] text-secondary font-medium mt-0.5">
									{location}
								</span>
							</div>

							{/* Progression Track for Company Roles */}
							<div className="flex flex-col gap-6 pl-3 border-l border-[var(--border-default)] ml-1 mt-1">
								{exp.roles.map((roleItem) => {
									const role =
										lang === "es" ? roleItem.roleEs : roleItem.roleEn;
									const period =
										lang === "es" ? roleItem.periodEs : roleItem.periodEn;
									const details =
										lang === "es" ? roleItem.detailsEs : roleItem.detailsEn;

									return (
										<div key={roleItem.roleEn} className="relative">
											{/* Progression Sub-dot */}
											<span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border-hover)] shadow-[0_0_4px_rgba(74,222,128,0.3)]" />

											{/* Role info: Date period above title */}
											<div className="flex flex-col gap-1">
												<span className="text-[12px] font-mono text-secondary">
													{period}
												</span>
												<h4 className="text-[14.5px] font-semibold text-primary">
													{role}
												</h4>
											</div>

											{/* Details Paragraph */}
											<p className="mt-2 text-[13px] text-secondary leading-relaxed">
												{details}
											</p>

											{/* Skills Badges */}
											<div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2.5">
												{roleItem.skills.map((skill) => (
													<span
														key={skill}
														className="font-mono text-[11px] sm:text-[11.5px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)] text-secondary"
													>
														{skill}
													</span>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};
