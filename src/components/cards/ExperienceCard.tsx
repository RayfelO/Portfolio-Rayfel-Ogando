import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { experiences } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { cardVariants } from "../layout/BentoGrid";

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
			className="bento-card col-span-2 flex flex-col gap-4 justify-between"
		>
			{/* Header */}
			<div className="select-none flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
				<h2 className="text-[13px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.experience}
				</h2>
				<Briefcase size={14} className="text-secondary stroke-[2.5]" />
			</div>

			{/* Timeline Container */}
			<div className="relative flex-1 pl-4 border-l border-[var(--border-default)] ml-2 flex flex-col gap-8">
				{experiences.map((exp) => {
					const location = lang === "es" ? exp.locationEs : exp.locationEn;
					const isCurrent = exp.roles.some((r) => r.current);

					return (
						<div key={exp.id} className="relative group flex flex-col gap-3">
							{/* Timeline Indicator Dot for the Company */}
							<span className="absolute -left-[23px] top-1 flex h-3.5 w-3.5 items-center justify-center select-none">
								{isCurrent ? (
									<>
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
									</>
								) : (
									<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--border-hover)]" />
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
									const type =
										lang === "es" ? roleItem.typeEs : roleItem.typeEn;
									const period =
										lang === "es" ? roleItem.periodEs : roleItem.periodEn;
									const details =
										lang === "es" ? roleItem.detailsEs : roleItem.detailsEn;

									return (
										<div key={roleItem.roleEn} className="relative">
											{/* Progression Sub-dot */}
											<span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border-hover)]" />

											{/* Role info: Date period above title */}
											<div className="flex flex-col gap-1">
												<span className="text-[12px] font-mono text-secondary">
													{period}
												</span>
												<h4 className="text-[14.5px] font-semibold text-primary">
													{role}
												</h4>
												<div className="text-[12.5px] text-secondary font-medium">
													<span>{type}</span>
												</div>
											</div>

											{/* Details List */}
											<ul className="mt-2 text-[14.5px] text-secondary list-disc pl-4 space-y-1 leading-relaxed">
												{details.map((detail) => (
													<li key={detail}>{detail}</li>
												))}
											</ul>

											{/* Skills Badges */}
											<div className="flex flex-wrap gap-1.5 mt-2.5">
												{roleItem.skills.map((skill) => (
													<span
														key={skill}
														className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)] text-secondary"
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
