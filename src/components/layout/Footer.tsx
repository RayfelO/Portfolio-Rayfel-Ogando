import type React from "react";

interface FooterProps {
	lang: "en" | "es";
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full text-center py-8 border-t border-[var(--border-default)] mt-12 select-none">
			<p className="text-[13px] font-mono text-secondary">
				&copy; {currentYear} Rayfel Ogando.{" "}
				{lang === "es"
					? "Todos los derechos reservados."
					: "All rights reserved."}
			</p>
		</footer>
	);
};
