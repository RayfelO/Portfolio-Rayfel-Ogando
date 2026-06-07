import { FileText, Mail } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import cvPdf from "../../assets/Rayfel_Jhonsel_Ogando_Soler_CV.pdf";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { GithubIcon } from "../icons/GithubIcon";
import { LinkedinIcon } from "../icons/LinkedinIcon";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface SocialLinkButtonProps {
	href: string;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	sublabel: string;
}

const SocialLinkButton: React.FC<SocialLinkButtonProps> = ({
	href,
	onClick,
	icon,
	label,
	sublabel,
}) => (
	<motion.a
		whileHover={{ y: -2, scale: 1.01 }}
		whileTap={{ scale: 0.99 }}
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		onClick={onClick}
		className="flex items-center gap-3 w-full px-3.5 py-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-secondary hover:text-primary transition-all duration-150 group"
	>
		{icon}
		<div className="min-w-0 flex flex-col text-left">
			<span className="text-[13.5px] font-semibold tracking-tight text-primary leading-tight">
				{label}
			</span>
			<span className="truncate text-[12px] text-secondary leading-tight mt-0.5">
				{sublabel}
			</span>
		</div>
	</motion.a>
);

interface ContactCardProps {
	t: Translations;
	lang: "en" | "es";
	onOpenModal: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
	t,
	lang,
	onOpenModal,
}) => {
	const handleGithubClick = () => {
		track.contactClicked("github");
	};

	const handleLinkedinClick = () => {
		track.contactClicked("linkedin");
	};

	const handleMessageClick = () => {
		onOpenModal();
		track.contactModalOpened();
	};

	const handleCvClick = () => {
		track.contactClicked("cv");
	};

	return (
		<motion.div
			variants={cardVariants}
			{...cardHoverProps}
			className="bento-card bento-col-1 flex flex-col gap-4 justify-between min-[581px]:min-h-[180px] min-[900px]:min-h-[260px]"
		>
			{/* Header */}
			<div className="select-none">
				<h2 className="text-[13px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.contact}
				</h2>
			</div>

			{/* Buttons block */}
			<div className="flex flex-col gap-2.5 flex-1 justify-center">
				<SocialLinkButton
					href="https://github.com/Rayfel2"
					onClick={handleGithubClick}
					icon={
						<GithubIcon
							size={18}
							className="text-secondary group-hover:text-primary transition-colors"
						/>
					}
					label="GitHub"
					sublabel="github.com/Rayfel2"
				/>

				<SocialLinkButton
					href="https://www.linkedin.com/in/rayfel-ogando"
					onClick={handleLinkedinClick}
					icon={
						<LinkedinIcon
							size={18}
							className="text-secondary group-hover:text-primary transition-colors"
						/>
					}
					label="LinkedIn"
					sublabel="in/rayfel-ogando"
				/>

				<SocialLinkButton
					href={cvPdf}
					onClick={handleCvClick}
					icon={
						<FileText
							size={18}
							className="text-secondary group-hover:text-primary transition-colors"
						/>
					}
					label={lang === "es" ? "Ver CV" : "View CV"}
					sublabel="Rayfel Ogando"
				/>

				{/* CTA modal launcher button */}
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					transition={{ type: "spring", stiffness: 450, damping: 20 }}
					type="button"
					onClick={handleMessageClick}
					className="flex items-center justify-center gap-2 w-full px-3.5 py-3 rounded-lg bg-[var(--accent-brand)] hover:bg-[var(--accent-brand)]/85 text-white hover:shadow-[0_0_12px_rgba(43,69,136,0.35)] transition-all duration-150 cursor-pointer font-mono text-[13.5px] font-semibold"
					style={{ border: "none" }}
				>
					<Mail size={14} className="stroke-[2.5]" />
					{t.contactModal.submitButton}
				</motion.button>
			</div>
		</motion.div>
	);
};
