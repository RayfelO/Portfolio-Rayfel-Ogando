import { motion } from "motion/react";
import type React from "react";
import { cardVariants } from "../layout/BentoGrid";

interface AvatarCardProps {
	id?: string;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({ id }) => {
	return (
		<motion.div
			id={id}
			variants={cardVariants}
			className="bento-card col-span-1 relative overflow-hidden p-0 border border-[var(--border-default)] hover:border-[var(--border-hover)] group"
			style={{ minHeight: "220px" }}
		>
			{/* Profile Image with horizontal flip (scale-x-[-1]) and hover zoom */}
			<img
				src="https://avatars.githubusercontent.com/u/141379819?v=4"
				alt="Rayfel Ogando"
				loading="eager"
				className="w-full h-full absolute inset-0 object-cover select-none transition-transform duration-500 [transform:scaleX(-1)] group-hover:[transform:scaleX(-1)_scale(1.05)]"
			/>
			{/* Bottom black gradient vignette overlay */}
			<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
		</motion.div>
	);
};
