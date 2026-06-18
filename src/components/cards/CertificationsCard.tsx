import { Award, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { SiFortinet, SiMeta } from "react-icons/si";
import { TbCertificate, TbChartBar, TbCode, TbSchool } from "react-icons/tb";
import { certifications } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface CertificationsCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
	className?: string;
}

const getCertIcon = (id: string, issuer: string) => {
	const idLower = id.toLowerCase();
	const issuerLower = issuer.toLowerCase();

	if (issuerLower.includes("meta")) return SiMeta;
	if (idLower.includes("fortinet")) return SiFortinet;
	if (idLower.includes("sas")) return TbChartBar;
	if (idLower.includes("web-front-end")) return TbCode;
	if (idLower.includes("virtual-study")) return TbSchool;
	return TbCertificate;
};

export const CertificationsCard: React.FC<CertificationsCardProps> = ({
	id,
	t,
	lang,
	className,
}) => {
	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...cardHoverProps}
			className={`bento-card bento-col-2 flex flex-col gap-4 justify-between min-[900px]:max-h-[360px] ${className || ""}`}
		>
			{/* Header */}
			<div className="select-none flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
				<h2 className="text-[13.5px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.certifications}
				</h2>
				<Award size={14} className="text-secondary stroke-[2.5]" />
			</div>

			{/* List Container without scrollbar visual */}
			<div className="certs-scroll-fade flex-1 overflow-visible min-[900px]:overflow-y-auto pr-1 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{certifications.map((cert) => {
					const name = lang === "es" ? cert.nameEs : cert.nameEn;
					const date = lang === "es" ? cert.dateEs : cert.dateEn;
					const Icon = getCertIcon(cert.id, cert.issuer);

					const content = (
						<>
							{/* Left: Icon Badge */}
							<div className="flex-shrink-0 mt-0.5 select-none">
								<div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center text-secondary group-hover/cert:border-[var(--border-hover)] transition-colors">
									<Icon className="w-4 h-4 text-secondary group-hover/cert:text-primary transition-colors" />
								</div>
							</div>

							{/* Right: Content details */}
							<div className="flex-1 flex flex-col gap-0.5">
								<div className="flex justify-between items-start gap-3">
									<span className="text-[14.5px] font-semibold text-primary leading-snug group-hover/cert:text-[var(--status-blue)] transition-all duration-150">
										{name}
									</span>
									{cert.url && (
										<ExternalLink
											size={12}
											className="text-secondary opacity-60 group-hover/cert:opacity-100 group-hover/cert:text-[var(--status-blue)] group-hover/cert:translate-x-0.5 group-hover/cert:-translate-y-0.5 transition-all flex-shrink-0 mt-0.5"
										/>
									)}
								</div>

								<div className="flex flex-wrap items-center justify-between gap-1.5 text-[12.5px] text-secondary font-medium mt-0.5 font-normal">
									<span>
										{cert.issuer} · {date}
									</span>
								</div>
							</div>
						</>
					);

					if (cert.url) {
						return (
							<motion.a
								whileHover={{ x: 3 }}
								transition={{ type: "spring", stiffness: 350, damping: 22 }}
								key={cert.id}
								href={cert.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex gap-3 pb-3.5 border-b border-[var(--border-default)] last:border-0 last:pb-0 group/cert cursor-pointer text-left w-full"
							>
								{content}
							</motion.a>
						);
					}

					return (
						<div
							key={cert.id}
							className="flex gap-3 pb-3.5 border-b border-[var(--border-default)] last:border-0 last:pb-0 text-left w-full"
						>
							{content}
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};
