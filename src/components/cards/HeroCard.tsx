import { type Easing, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Translations } from "../../i18n/translations";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface HeroCardProps {
	t: Translations;
}

export const HeroCard: React.FC<HeroCardProps> = ({ t }) => {
	const [typedRole, setTypedRole] = useState("");
	const fullRole = t.hero.role;

	// Typewriter effect that resets when fullRole changes (i.e. language toggle)
	useEffect(() => {
		if (!fullRole) return;

		let isMounted = true;
		const firstChar = fullRole.charAt(0);
		setTypedRole(firstChar);

		let current = firstChar;
		let index = 1;

		const interval = setInterval(() => {
			if (!isMounted) return;
			if (index < fullRole.length) {
				current += fullRole.charAt(index);
				setTypedRole(current);
				index++;
			} else {
				clearInterval(interval);
			}
		}, 45); // Speed of typing

		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [fullRole]);

	return (
		<motion.div
			variants={cardVariants}
			{...cardHoverProps}
			className="bento-card bento-card--accent bento-col-2 flex flex-col justify-between items-start gap-4"
		>
			<div className="flex flex-col gap-4 w-full">
				{/* Top: Name and Role */}
				<div>
					<h1 className="text-[26px] min-[480px]:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[42px] font-semibold text-primary tracking-tight leading-none">
						Rayfel Ogando
					</h1>
					<p className="font-mono text-[16px] font-semibold text-secondary mt-2 min-h-[20px]">
						<span className="text-secondary">{typedRole}</span>
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{
								repeat: Infinity,
								duration: 0.8,
								ease: "steps(2)" as unknown as Easing,
							}}
							className="inline-block w-[6px] h-[14px] bg-primary ml-[2px] align-middle"
						/>
					</p>
				</div>

				{/* Bio */}
				<p className="text-[15px] sm:text-[16px] text-secondary leading-relaxed font-normal">
					{t.hero.bio}
				</p>
			</div>

			{/* Bottom: Status Badge */}
			<motion.div
				whileHover={{ scale: 1.03 }}
				transition={{ type: "spring", stiffness: 450, damping: 20 }}
				className="flex items-center gap-2 mt-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 rounded-full cursor-pointer"
			>
				<span className="relative flex h-2.5 w-2.5">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-green)] opacity-75" />
					<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--status-green)]" />
				</span>
				<span className="font-mono text-[13px] font-medium text-secondary">
					{t.hero.status}
				</span>
			</motion.div>
		</motion.div>
	);
};
