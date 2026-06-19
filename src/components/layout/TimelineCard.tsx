import { motion } from "motion/react";
import type React from "react";
import { cardHoverProps, cardVariants } from "./BentoGrid";

interface TimelineCardProps {
	id?: string;
	title: React.ReactNode;
	icon: React.ReactNode;
	className?: string;
	gap?: string;
	children: React.ReactNode;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
	id,
	title,
	icon,
	className,
	gap = "gap-6",
	children,
}) => (
	<motion.div
		id={id}
		variants={cardVariants}
		{...cardHoverProps}
		className={`bento-card bento-col-2 flex flex-col gap-4 justify-between overflow-visible ${className || ""}`}
	>
		<div className="select-none flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
			<h2 className="text-[13px] font-bold uppercase tracking-wider text-secondary">
				{title}
			</h2>
			{icon}
		</div>
		<div
			className={`relative flex-1 pl-4 border-l border-[var(--accent-brand)]/25 ml-2 flex flex-col ${gap} overflow-visible`}
		>
			{children}
		</div>
	</motion.div>
);
