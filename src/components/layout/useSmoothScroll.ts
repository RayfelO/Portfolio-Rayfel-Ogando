import { useLenis } from "lenis/react";

export const useSmoothScroll = () => {
	const lenis = useLenis();

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			if (lenis) {
				lenis.scrollTo(element, { offset: -80 });
			} else {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	return scrollToSection;
};
