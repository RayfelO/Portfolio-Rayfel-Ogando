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

export const CustomCursor: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isHoveringClickable, setIsHoveringClickable] = useState(false);
	const [theme, setTheme] = useState<"dark" | "light">("dark");
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	const springConfig = { damping: 28, stiffness: 400 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

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

	// Sync theme from data-theme attribute
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

	const brandColor = "#2b4588";

	const ringBorder = theme === "light" ? brandColor : "rgba(255,255,255,0.75)";
	const ringBg = isHoveringClickable
		? theme === "light"
			? "rgba(43,69,136,0.08)"
			: "rgba(255,255,255,0.12)"
		: theme === "light"
			? "rgba(43,69,136,0.12)"
			: "rgba(255,255,255,0.18)";
	const dotColor = theme === "light" ? brandColor : "rgba(255,255,255,0.95)";

	return (
		<motion.div
			className="custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
			style={{
				x: cursorXSpring,
				y: cursorYSpring,
				translateX: "-50%",
				translateY: "-50%",
			}}
			animate={{
				opacity: isVisible ? 1 : 0,
				scale: isVisible ? 1 : 0.5,
			}}
			transition={{ duration: 0.15, ease: "easeOut" }}
		>
			<motion.div
				className="rounded-full backdrop-blur-[2px]"
				style={{
					width: isHoveringClickable ? 40 : 20,
					height: isHoveringClickable ? 40 : 20,
					borderWidth: isHoveringClickable ? 2 : 1,
					borderStyle: "solid",
					borderColor: ringBorder,
					backgroundColor: ringBg,
				}}
				transition={{
					type: "spring",
					stiffness: 400,
					damping: 25,
				}}
			/>
			{isHoveringClickable && (
				<motion.div
					className="absolute rounded-full"
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0, opacity: 0 }}
					transition={{ duration: 0.15 }}
					style={{ width: 4, height: 4, backgroundColor: dotColor }}
				/>
			)}
		</motion.div>
	);
};
