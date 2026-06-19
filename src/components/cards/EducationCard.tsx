import { GraduationCap } from "lucide-react";
import type React from "react";
import { educations } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { TimelineCard } from "../layout/TimelineCard";

interface EducationCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
	className?: string;
}

const getFieldEs = <T extends { Es: string; En: string }>(
	fields: T,
	lang: "en" | "es",
): string => (lang === "es" ? fields.Es : fields.En);

const isCurrentPeriod = (period: string): boolean =>
	period.toLowerCase().includes("actualidad") || period.includes("2026");

interface EducationItemProps {
	edu: (typeof educations)[number];
	lang: "en" | "es";
}

const EducationItem: React.FC<EducationItemProps> = ({ edu, lang }) => {
	const degree = getFieldEs({ Es: edu.degreeEs, En: edu.degreeEn }, lang);
	const period = getFieldEs({ Es: edu.periodEs, En: edu.periodEn }, lang);
	const details = getFieldEs({ Es: edu.detailsEs, En: edu.detailsEn }, lang);
	const current = isCurrentPeriod(period);

	return (
		<div className="relative group">
			<span className="absolute -left-[23px] top-1.5 flex h-3.5 w-3.5 items-center justify-center">
				{current ? (
					<>
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-blue)] opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-blue)] shadow-[0_0_6px_rgba(43,69,136,0.5)]" />
					</>
				) : (
					<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--border-hover)] shadow-[0_0_4px_rgba(43,69,136,0.3)]" />
				)}
			</span>

			<div className="flex flex-col gap-1">
				<span className="text-[12px] font-mono text-secondary">{period}</span>
				<h3 className="text-[15.5px] font-semibold text-primary">{degree}</h3>
				<div className="text-[13.5px] text-secondary font-medium italic">
					<span>{edu.institution}</span>
				</div>
			</div>

			<p className="mt-2 text-[13px] text-secondary leading-relaxed">
				{details}
			</p>
		</div>
	);
};

export const EducationCard: React.FC<EducationCardProps> = ({
	id,
	t,
	lang,
	className,
}) => {
	return (
		<TimelineCard
			id={id}
			title={t.sections.education}
			icon={<GraduationCap size={15} className="text-secondary stroke-[2.5]" />}
			className={className}
			gap="gap-6"
		>
			{educations.map((edu) => (
				<EducationItem key={edu.id} edu={edu} lang={lang} />
			))}
		</TimelineCard>
	);
};
