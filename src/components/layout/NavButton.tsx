import { motion } from "motion/react";

interface NavButtonProps {
	id: string;
	label: string;
	isActive: boolean;
	onClick: (id: string) => void;
}

const ACTIVE_STYLE = {
	scale: 1.25,
	backgroundColor: "var(--accent-brand)",
	borderColor: "var(--accent-brand)",
	boxShadow: "0 0 8px rgba(43, 69, 136, 0.65)",
} as const;

const INACTIVE_STYLE = {
	scale: 1,
	backgroundColor: "var(--bg-base)",
	borderColor: "var(--border-default)",
	boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
} as const;

const getNavLabelClass = (isActive: boolean): string =>
	isActive ? "text-primary font-semibold" : "text-secondary font-normal";

export const NavButton: React.FC<NavButtonProps> = ({
	id,
	label,
	isActive,
	onClick,
}) => (
	<button
		type="button"
		onClick={() => onClick(id)}
		className="group flex items-center gap-3.5 text-left cursor-pointer focus:outline-none"
	>
		<div className="relative w-2 h-2 -ml-[20px] flex items-center justify-center flex-shrink-0">
			<motion.div
				animate={isActive ? ACTIVE_STYLE : INACTIVE_STYLE}
				whileHover={!isActive ? { borderColor: "var(--text-secondary)" } : {}}
				transition={{ type: "spring", stiffness: 300, damping: 25 }}
				className="w-2 h-2 rounded-full border"
			/>
		</div>
		<span
			className={`text-[12.5px] font-medium tracking-tight transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary ${getNavLabelClass(isActive)}`}
		>
			{label}
		</span>
	</button>
);
