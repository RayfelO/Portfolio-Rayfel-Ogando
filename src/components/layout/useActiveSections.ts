import { useEffect, useRef, useState } from "react";

interface Section {
	id: string;
	label: string;
}

export const useActiveSections = (sections: Section[]) => {
	const [activeSections, setActiveSections] = useState<string[]>(["inicio"]);
	const intersectionMapRef = useRef<Record<string, boolean>>({});

	useEffect(() => {
		const map = intersectionMapRef.current;
		for (const sec of sections) {
			map[sec.id] = sec.id === "inicio";
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					map[entry.target.id] = entry.isIntersecting;
				}

				const nextActive = sections
					.filter((sec) => map[sec.id])
					.map((sec) => sec.id);

				if (nextActive.length > 0) {
					setActiveSections((prev) => {
						const isSame =
							prev.length === nextActive.length &&
							prev.every((val, index) => val === nextActive[index]);
						return isSame ? prev : nextActive;
					});
				}
			},
			{
				rootMargin: "-120px 0px -45% 0px",
				threshold: 0,
			},
		);

		for (const sec of sections) {
			const el = document.getElementById(sec.id);
			if (el) {
				observer.observe(el);
			}
		}

		return () => {
			observer.disconnect();
		};
	}, [sections]);

	return activeSections;
};
