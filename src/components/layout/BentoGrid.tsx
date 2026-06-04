import { motion } from "motion/react";
import type React from "react";

interface BentoGridProps {
	children: React.ReactNode;
}

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.1,
		},
	},
};

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
	return (
		<motion.main
			variants={containerVariants}
			initial="hidden"
			animate="show"
			className="bento-grid px-4 pb-12"
		>
			{children}
		</motion.main>
	);
};

// Motion variant helper to be used by all individual cards
export const cardVariants = {
	hidden: { opacity: 0, y: 12 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.35,
			ease: [0.16, 1, 0.3, 1] as const, // Linear's signature spring ease curve
		},
	},
};
