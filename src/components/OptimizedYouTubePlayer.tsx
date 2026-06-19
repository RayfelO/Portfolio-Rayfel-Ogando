import type React from "react";
import { useEffect, useRef, useState } from "react";
import { LoadingMedia } from "./media/LoadingMedia";

interface OptimizedYouTubePlayerProps {
	youtubeUrl: string;
	projectName: string;
	muted: boolean;
	autoplay?: boolean;
	showControls?: boolean;
	className?: string;
	fit?: "contain" | "cover";
	lang: "en" | "es";
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

const useYouTubeObserver = (
	videoId: string | null,
	autoplay: boolean,
	muted: boolean,
	fit: string,
) => {
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
		return () => observer.disconnect();
	}, [fit]);

	useEffect(() => {
		const target = containerRef.current;
		if (!target || !videoId) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (autoplay) postPlayerCommand(iframeRef.current, "playVideo");
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
		if (autoplay) postPlayerCommand(iframeRef.current, "playVideo");
	}, [autoplay, muted]);

	return { iframeRef, containerRef, dimensions };
};

const FallbackFrame: React.FC<{
	youtubeUrl: string;
	projectName: string;
	fit: string;
	className: string;
	iframeStyle: React.CSSProperties;
	onLoad: () => void;
	onError: () => void;
	style?: React.CSSProperties;
}> = ({
	youtubeUrl,
	projectName,
	fit,
	className,
	iframeStyle,
	onLoad,
	onError,
	style,
}) => (
	<iframe
		src={youtubeUrl}
		title={`${projectName} video demo`}
		className={
			fit === "cover"
				? "absolute border-0"
				: `absolute inset-0 h-full w-full border-0 ${className}`
		}
		style={{
			...(fit === "cover" ? iframeStyle : {}),
			...style,
		}}
		onLoad={onLoad}
		onError={onError}
		allowFullScreen
	/>
);

const toParam = (v: boolean): "1" | "0" => (v ? "1" : "0");

const getIframeKey = (
	videoId: string,
	muted: boolean,
	autoplay: boolean,
	showControls: boolean,
): string =>
	`${videoId}-${muted ? "muted" : "sound"}-${autoplay ? "auto" : "manual"}-${showControls ? "controls" : "clean"}`;

const getIframeClassName = (fit: string): string =>
	fit === "cover"
		? "absolute border-0"
		: "absolute inset-0 h-full w-full border-0";

const YouTubeEmbed: React.FC<{
	videoId: string;
	projectName: string;
	muted: boolean;
	autoplay: boolean;
	showControls: boolean;
	className: string;
	fit: string;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	containerRef: React.RefObject<HTMLDivElement | null>;
	iframeStyle: React.CSSProperties;
	onLoad: () => void;
	onError: () => void;
	style?: React.CSSProperties;
}> = ({
	videoId,
	projectName,
	muted,
	autoplay,
	showControls,
	className,
	fit,
	iframeRef,
	containerRef,
	iframeStyle,
	onLoad,
	onError,
	style,
}) => {
	const query = new URLSearchParams({
		enablejsapi: "1",
		autoplay: toParam(autoplay),
		mute: toParam(muted),
		controls: toParam(showControls),
		playsinline: "1",
		rel: "0",
		modestbranding: "1",
		disablekb: toParam(!showControls),
	});

	return (
		<div
			ref={containerRef}
			className={`absolute inset-0 overflow-hidden bg-transparent ${className}`}
			style={style}
		>
			<iframe
				key={getIframeKey(videoId, muted, autoplay, showControls)}
				ref={iframeRef}
				src={`https://www.youtube.com/embed/${videoId}?${query.toString()}`}
				title={`${projectName} video demo`}
				className={`${getIframeClassName(fit)} ${fit === "cover" ? "" : className}`}
				style={fit === "cover" ? iframeStyle : undefined}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				onLoad={onLoad}
				onError={onError}
				allowFullScreen
			/>
		</div>
	);
};

const computeCoverStyle = (dims: {
	width: number;
	height: number;
}): React.CSSProperties => {
	const containerRatio = dims.width / dims.height;
	const videoRatio = 16 / 9;
	if (containerRatio > videoRatio) {
		const height = dims.width / videoRatio;
		return {
			width: `${dims.width}px`,
			height: `${height}px`,
			top: `${(dims.height - height) / 2}px`,
			left: "0px",
		};
	}
	const width = dims.height * videoRatio;
	return {
		width: `${width}px`,
		height: `${dims.height}px`,
		left: `${(dims.width - width) / 2}px`,
		top: "0px",
	};
};

const computeIframeStyle = (
	fit: string,
	dimensions: { width: number; height: number },
): React.CSSProperties => {
	if (fit === "cover" && dimensions.width > 0 && dimensions.height > 0) {
		return computeCoverStyle(dimensions);
	}
	return {};
};

export const OptimizedYouTubePlayer: React.FC<OptimizedYouTubePlayerProps> = ({
	youtubeUrl,
	projectName,
	muted,
	autoplay = true,
	showControls = false,
	className = "",
	fit = "contain",
	lang,
}) => {
	const videoId = getYouTubeId(youtubeUrl);
	const { iframeRef, containerRef, dimensions } = useYouTubeObserver(
		videoId,
		autoplay,
		muted,
		fit,
	);

	const iframeStyle = computeIframeStyle(fit, dimensions);

	if (!videoId) {
		return (
			<LoadingMedia lang={lang} className="absolute inset-0 h-full w-full">
				{({ onLoad, onError, style }) => (
					<FallbackFrame
						youtubeUrl={youtubeUrl}
						projectName={projectName}
						fit={fit}
						className={className}
						iframeStyle={iframeStyle}
						onLoad={onLoad}
						onError={onError}
						style={style}
					/>
				)}
			</LoadingMedia>
		);
	}

	return (
		<LoadingMedia lang={lang} className="absolute inset-0 h-full w-full">
			{({ onLoad, onError, style }) => (
				<YouTubeEmbed
					videoId={videoId}
					projectName={projectName}
					muted={muted}
					autoplay={autoplay}
					showControls={showControls}
					className={className}
					fit={fit}
					iframeRef={iframeRef}
					containerRef={containerRef}
					iframeStyle={iframeStyle}
					onLoad={onLoad}
					onError={onError}
					style={style}
				/>
			)}
		</LoadingMedia>
	);
};
