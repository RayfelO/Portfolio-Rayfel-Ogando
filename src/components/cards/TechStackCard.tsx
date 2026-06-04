import { motion } from "motion/react";
import type React from "react";
import { GrOracle } from "react-icons/gr";
import {
	SiAngular,
	SiDotnet,
	SiJavascript,
	SiMongodb,
	SiMysql,
	SiNodedotjs,
	SiReact,
	SiRust,
	SiSharp,
	SiTypescript,
} from "react-icons/si";
import { TbDatabase } from "react-icons/tb";
import { techStack } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { cardVariants } from "../layout/BentoGrid";

interface TechStackCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	csharp: SiSharp,
	dotnet: SiDotnet,
	aspnet: SiDotnet, // Represented by dotnet logo
	nodejs: SiNodedotjs,
	angular: SiAngular,
	react: SiReact,
	typescript: SiTypescript,
	javascript: SiJavascript,
	sqlserver: TbDatabase,
	mongodb: SiMongodb,
	mysql: SiMysql,
	rust: SiRust,
	oracle: GrOracle,
};

export const TechStackCard: React.FC<TechStackCardProps> = ({
	id,
	t,
	lang,
}) => {
	const handleTechClick = (name: string) => {
		track.contactClicked(`tech_${name.toLowerCase()}`);
	};

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			className="bento-card col-span-2 flex flex-col gap-5 justify-between"
		>
			{/* Header */}
			<div className="select-none pb-2 border-b border-[var(--border-default)]">
				<h2 className="text-[14.5px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.stack}
				</h2>
			</div>

			{/* Tech Categories Grid - Responsive 3 Columns */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
				{techStack.map((group) => {
					const title = lang === "es" ? group.titleEs : group.titleEn;
					return (
						<div key={group.titleEn} className="flex flex-col gap-2.5">
							{/* Category Title */}
							<span className="text-[13.5px] font-bold text-secondary uppercase tracking-wider pb-1 border-b border-[var(--border-default)] select-none">
								{title}
							</span>

							{/* Items Stack */}
							<div className="flex flex-col gap-2">
								{group.items.map((item) => {
									const IconComponent = iconMap[item.iconName];
									return (
										<a
											key={item.name}
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => handleTechClick(item.name)}
											className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-secondary hover:text-primary transition-all duration-150 group"
										>
											{IconComponent && (
												<IconComponent className="w-4.5 h-4.5 text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
											)}
											<span className="text-[15.5px] font-semibold tracking-tight">
												{item.name}
											</span>
										</a>
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
