import { motion, useMotionValue, useSpring } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";

const CLICKABLE_SELECTOR = [
	"a",
	"button",
	"input",
	"textarea",
	"select",
	"summary",
	"[role='button']",
	"[role='link']",
	"[role='checkbox']",
	"[role='radio']",
	"[role='tab']",
	"[role='menuitem']",
	"[onclick]",
	".cursor-pointer",
	".cursor-zoom-in",
	".cursor-zoom-out",
].join(",");

const useThemeSync = () => {
	const [theme, setTheme] = useState<"dark" | "light">("dark");

	useEffect(() => {
		const initialTheme = document.documentElement.dataset.theme;
		setTheme(initialTheme === "light" ? "light" : "dark");

		const observer = new MutationObserver(() => {
			const current = document.documentElement.dataset.theme;
			setTheme(current === "light" ? "light" : "dark");
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		return () => observer.disconnect();
	}, []);

	return theme;
};

const useCursorTracking = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isHoveringClickable, setIsHoveringClickable] = useState(false);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	useEffect(() => {
		const moveCursor = (e: MouseEvent) => {
			cursorX.set(e.clientX);
			cursorY.set(e.clientY);
			if (!isVisible) setIsVisible(true);
		};

		const hideCursor = () => setIsVisible(false);
		const showCursor = () => setIsVisible(true);

		const checkHover = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const isClickable = target.closest(CLICKABLE_SELECTOR) !== null;
			setIsHoveringClickable(isClickable);
		};

		window.addEventListener("mousemove", moveCursor);
		window.addEventListener("mouseover", checkHover);
		document.addEventListener("mouseleave", hideCursor);
		document.addEventListener("mouseenter", showCursor);

		return () => {
			window.removeEventListener("mousemove", moveCursor);
			window.removeEventListener("mouseover", checkHover);
			document.removeEventListener("mouseleave", hideCursor);
			document.removeEventListener("mouseenter", showCursor);
		};
	}, [cursorX, cursorY, isVisible]);

	return { isVisible, isHoveringClickable, cursorX, cursorY };
};

function getCursorAnimation(isVisible: boolean) {
	return { opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 };
}

function getCursorRingStyle(
	isHoveringClickable: boolean,
	ringBorder: string,
	ringBg: string,
) {
	return {
		width: isHoveringClickable ? 40 : 20,
		height: isHoveringClickable ? 40 : 20,
		borderWidth: isHoveringClickable ? 2 : 1,
		borderStyle: "solid" as const,
		borderColor: ringBorder,
		backgroundColor: ringBg,
	};
}

const CursorDot: React.FC<{ dotColor: string }> = ({ dotColor }) => (
	<motion.div
		className="absolute rounded-full"
		initial={{ scale: 0, opacity: 0 }}
		animate={{ scale: 1, opacity: 1 }}
		exit={{ scale: 0, opacity: 0 }}
		transition={{ duration: 0.15 }}
		style={{ width: 4, height: 4, backgroundColor: dotColor }}
	/>
);

const CURSOR_STYLES = {
	light: {
		ringBorder: "#2b4588",
		ringBgHover: "rgba(43,69,136,0.08)",
		ringBgDefault: "rgba(43,69,136,0.12)",
		dotColor: "#2b4588",
	},
	dark: {
		ringBorder: "rgba(255,255,255,0.75)",
		ringBgHover: "rgba(255,255,255,0.12)",
		ringBgDefault: "rgba(255,255,255,0.18)",
		dotColor: "rgba(255,255,255,0.95)",
	},
} as const;

export const CustomCursor: React.FC = () => {
	const theme = useThemeSync();
	const { isVisible, isHoveringClickable, cursorX, cursorY } =
		useCursorTracking();

	const springConfig = { damping: 28, stiffness: 400 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

	const s = CURSOR_STYLES[theme];
	const ringBorder = s.ringBorder;
	const ringBg = isHoveringClickable ? s.ringBgHover : s.ringBgDefault;
	const dotColor = s.dotColor;

	return (
		<motion.div
			className="custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
			style={{
				x: cursorXSpring,
				y: cursorYSpring,
				translateX: "-50%",
				translateY: "-50%",
			}}
			animate={getCursorAnimation(isVisible)}
			transition={{ duration: 0.15, ease: "easeOut" }}
		>
			<motion.div
				className="rounded-full backdrop-blur-[2px]"
				style={getCursorRingStyle(isHoveringClickable, ringBorder, ringBg)}
				transition={{
					type: "spring",
					stiffness: 400,
					damping: 25,
				}}
			/>
			{isHoveringClickable && <CursorDot dotColor={dotColor} />}
		</motion.div>
	);
};
