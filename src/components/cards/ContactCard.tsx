import { Mail } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { GithubIcon } from "../icons/GithubIcon";
import { LinkedinIcon } from "../icons/LinkedinIcon";
import { cardVariants } from "../layout/BentoGrid";

interface ContactCardProps {
	t: Translations;
	onOpenModal: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ t, onOpenModal }) => {
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

	return (
		<motion.div
			variants={cardVariants}
			className="bento-card col-span-1 flex flex-col gap-4 justify-between"
			style={{ minHeight: "220px" }}
		>
			{/* Header */}
			<div className="select-none">
				<h2 className="text-[13px] font-bold uppercase tracking-wider text-secondary">
					{t.sections.contact}
				</h2>
			</div>

			{/* Buttons block */}
			<div className="flex flex-col gap-2.5 flex-1 justify-center">
				{/* GitHub link button */}
				<a
					href="https://github.com/Rayfel2"
					target="_blank"
					rel="noopener noreferrer"
					onClick={handleGithubClick}
					className="flex items-center gap-3 w-full px-3.5 py-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-secondary hover:text-primary transition-all duration-150 group"
				>
					<GithubIcon
						size={18}
						className="text-secondary group-hover:text-primary transition-colors"
					/>
					<div className="flex flex-col text-left">
						<span className="text-[13.5px] font-semibold tracking-tight text-primary leading-tight">
							GitHub
						</span>
						<span className="text-[12px] text-secondary leading-tight mt-0.5">
							github.com/Rayfel2
						</span>
					</div>
				</a>

				{/* LinkedIn link button */}
				<a
					href="https://www.linkedin.com/in/rayfel-ogando"
					target="_blank"
					rel="noopener noreferrer"
					onClick={handleLinkedinClick}
					className="flex items-center gap-3 w-full px-3.5 py-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-secondary hover:text-primary transition-all duration-150 group"
				>
					<LinkedinIcon
						size={18}
						className="text-secondary group-hover:text-primary transition-colors"
					/>
					<div className="flex flex-col text-left">
						<span className="text-[13.5px] font-semibold tracking-tight text-primary leading-tight">
							LinkedIn
						</span>
						<span className="text-[12px] text-secondary leading-tight mt-0.5">
							in/rayfel-ogando
						</span>
					</div>
				</a>

				{/* CTA modal launcher button */}
				<button
					type="button"
					onClick={handleMessageClick}
					className="flex items-center justify-center gap-2 w-full px-3.5 py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-light)] text-[var(--accent-text)] hover:text-white transition-all duration-150 cursor-pointer font-mono text-[13.5px] font-semibold"
					style={{ border: "none" }}
				>
					<Mail size={14} className="stroke-[2.5]" />
					{t.contactModal.submitButton}
				</button>
			</div>
		</motion.div>
	);
};
