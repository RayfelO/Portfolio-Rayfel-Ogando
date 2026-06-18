import type React from "react";
import { useEffect, useRef, useState } from "react";

interface OptimizedYouTubePlayerProps {
	youtubeUrl: string;
	projectName: string;
	muted: boolean;
	autoplay?: boolean;
	showControls?: boolean;
	className?: string;
	fit?: "contain" | "cover";
}

const getYouTubeId = (url: string) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

const postPlayerCommand = (
	iframe: HTMLIFrameElement | null,
	func: "playVideo" | "pauseVideo" | "mute" | "unMute",
) => {
	if (!iframe?.contentWindow) return;

	try {
		iframe.contentWindow.postMessage(
			JSON.stringify({
				event: "command",
				func,
				args: "",
			}),
			"*",
		);
	} catch (err) {
		console.warn("YouTube player command failed:", err);
	}
};

export const OptimizedYouTubePlayer: React.FC<OptimizedYouTubePlayerProps> = ({
	youtubeUrl,
	projectName,
	muted,
	autoplay = true,
	showControls = false,
	className = "",
	fit = "contain",
}) => {
	const videoId = getYouTubeId(youtubeUrl);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (fit !== "cover" || !containerRef.current) return;
		const target = containerRef.current;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setDimensions({ width, height });
			}
		});
		observer.observe(target);
		return () => {
			observer.disconnect();
		};
	}, [fit]);

	useEffect(() => {
		const target = containerRef.current;
		if (!target || !videoId) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (autoplay) {
						postPlayerCommand(iframeRef.current, "playVideo");
					}
					postPlayerCommand(iframeRef.current, muted ? "mute" : "unMute");
				} else {
					postPlayerCommand(iframeRef.current, "pauseVideo");
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(target);

		return () => {
			observer.unobserve(target);
			observer.disconnect();
		};
	}, [autoplay, muted, videoId]);

	useEffect(() => {
		postPlayerCommand(iframeRef.current, muted ? "mute" : "unMute");
		if (autoplay) {
			postPlayerCommand(iframeRef.current, "playVideo");
		}
	}, [autoplay, muted]);

	const query = new URLSearchParams({
		enablejsapi: "1",
		autoplay: autoplay ? "1" : "0",
		mute: muted ? "1" : "0",
		controls: showControls ? "1" : "0",
		playsinline: "1",
		rel: "0",
		modestbranding: "1",
		disablekb: showControls ? "0" : "1",
	});

	let iframeStyle: React.CSSProperties = {};
	if (fit === "cover" && dimensions.width > 0 && dimensions.height > 0) {
		const containerRatio = dimensions.width / dimensions.height;
		const videoRatio = 16 / 9;

		if (containerRatio > videoRatio) {
			const width = dimensions.width;
			const height = width / videoRatio;
			iframeStyle = {
				width: `${width}px`,
				height: `${height}px`,
				top: `${(dimensions.height - height) / 2}px`,
				left: "0px",
			};
		} else {
			const height = dimensions.height;
			const width = height * videoRatio;
			iframeStyle = {
				width: `${width}px`,
				height: `${height}px`,
				left: `${(dimensions.width - width) / 2}px`,
				top: "0px",
			};
		}
	}

	if (!videoId) {
		return (
			<iframe
				src={youtubeUrl}
				title={`${projectName} video demo`}
				className={
					fit === "cover"
						? "absolute border-0"
						: `absolute inset-0 h-full w-full border-0 ${className}`
				}
				style={fit === "cover" ? iframeStyle : undefined}
				allowFullScreen
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			className={`absolute inset-0 overflow-hidden bg-transparent ${className}`}
		>
			<iframe
				key={`${videoId}-${muted ? "muted" : "sound"}-${autoplay ? "auto" : "manual"}-${showControls ? "controls" : "clean"}`}
				ref={iframeRef}
				src={`https://www.youtube.com/embed/${videoId}?${query.toString()}`}
				title={`${projectName} video demo`}
				className={
					fit === "cover"
						? "absolute border-0"
						: "absolute inset-0 h-full w-full border-0"
				}
				style={fit === "cover" ? iframeStyle : undefined}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
			/>
		</div>
	);
};
