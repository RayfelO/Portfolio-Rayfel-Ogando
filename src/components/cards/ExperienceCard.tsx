import { Briefcase } from "lucide-react";
import type React from "react";
import { experiences } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { TimelineCard } from "../layout/TimelineCard";

interface RoleItemProps {
	roleItem: (typeof experiences)[number]["roles"][number];
	lang: "en" | "es";
}

const RoleItem: React.FC<RoleItemProps> = ({ roleItem, lang }) => {
	const role = lang === "es" ? roleItem.roleEs : roleItem.roleEn;
	const period = lang === "es" ? roleItem.periodEs : roleItem.periodEn;
	const details = lang === "es" ? roleItem.detailsEs : roleItem.detailsEn;

	return (
		<div className="relative">
			<span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border-hover)] shadow-[0_0_4px_rgba(74,222,128,0.3)]" />
			<div className="flex flex-col gap-1">
				<span className="text-[12px] font-mono text-secondary">{period}</span>
				<h4 className="text-[14.5px] font-semibold text-primary">{role}</h4>
			</div>
			<p className="mt-2 text-[13px] text-secondary leading-relaxed">
				{details}
			</p>
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
};

interface ExperienceItemProps {
	exp: (typeof experiences)[number];
	lang: "en" | "es";
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ exp, lang }) => {
	const location = lang === "es" ? exp.locationEs : exp.locationEn;
	const isCurrent = exp.roles.some((r) => r.current);

	return (
		<div className="relative group flex flex-col gap-3">
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

			<div className="flex flex-col">
				<h3 className="text-[15.5px] font-semibold text-primary">
					{exp.company}
				</h3>
				<span className="text-[12.5px] text-secondary font-medium mt-0.5">
					{location}
				</span>
			</div>

			<div className="flex flex-col gap-6 pl-3 border-l border-[var(--border-default)] ml-1 mt-1">
				{exp.roles.map((roleItem) => (
					<RoleItem key={roleItem.roleEn} roleItem={roleItem} lang={lang} />
				))}
			</div>
		</div>
	);
};

interface ExperienceCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
	className?: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
	id,
	t,
	lang,
	className,
}) => {
	return (
		<TimelineCard
			id={id}
			title={t.sections.experience}
			icon={<Briefcase size={14} className="text-secondary stroke-[2.5]" />}
			className={className}
			gap="gap-8"
		>
			{experiences.map((exp) => (
				<ExperienceItem key={exp.id} exp={exp} lang={lang} />
			))}
		</TimelineCard>
	);
};
