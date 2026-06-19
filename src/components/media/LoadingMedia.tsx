import type React from "react";
import { useEffect, useState } from "react";

export type MediaStatus = "loading" | "loaded" | "stalled" | "error";

interface LoadingMediaProps {
	alt?: string;
	lang: "en" | "es";
	className?: string;
	timeoutMs?: number;
	style?: React.CSSProperties;
	minHeight?: string;
	minWidth?: string;
	display?: "block" | "inline-block";
	sizePreset?: "inline" | "content";
	children: (props: {
		onLoad: () => void;
		onError: () => void;
		style: React.CSSProperties;
		status: MediaStatus;
	}) => React.ReactNode;
}

const getOverlayText = (lang: "en" | "es"): string => {
	return lang === "es" ? "Cargando..." : "Loading...";
};

const getErrorText = (lang: "en" | "es"): string => {
	return lang === "es" ? "Error al cargar" : "Load Error";
};

const computeDimension = (
	isLoaded: boolean,
	hasExplicit: boolean,
	styleValue: string | number | undefined,
	fallbackValue: string | undefined,
): string | number | undefined => {
	if (isLoaded || hasExplicit) return undefined;
	return styleValue ?? fallbackValue;
};

const LoadingOverlay: React.FC<{
	lang: "en" | "es";
	hideText?: boolean;
}> = ({ lang, hideText }) => (
	<div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-card)] select-none animate-pulse">
		{!hideText && (
			<span className="text-[13px] font-mono text-secondary px-4 text-center">
				{getOverlayText(lang)}
			</span>
		)}
	</div>
);

const ErrorOverlay: React.FC<{
	lang: "en" | "es";
	alt?: string;
}> = ({ lang, alt }) => (
	<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-card)] p-3 border border-red-500/10 rounded-md select-none">
		<span className="text-[11px] font-mono text-red-500 uppercase tracking-wider mb-1">
			{getErrorText(lang)}
		</span>
		{alt && (
			<span className="text-[12px] font-sans text-secondary text-center line-clamp-2 px-2">
				{alt}
			</span>
		)}
	</div>
);

const MediaOverlay: React.FC<{
	status: MediaStatus;
	lang: "en" | "es";
	alt?: string;
	sizePreset?: "inline" | "content";
}> = ({ status, lang, alt, sizePreset }) => {
	if (status === "loading" || status === "stalled") {
		return <LoadingOverlay lang={lang} hideText={sizePreset === "inline"} />;
	}

	if (status === "error") {
		return <ErrorOverlay lang={lang} alt={alt} />;
	}

	return null;
};

export const LoadingMedia: React.FC<LoadingMediaProps> = ({
	alt,
	lang,
	className = "",
	timeoutMs = 10000,
	style = {},
	minHeight,
	minWidth,
	display = "block",
	sizePreset = "content",
	children,
}) => {
	const [status, setStatus] = useState<MediaStatus>("loading");

	useEffect(() => {
		if (status !== "loading") return;

		const timer = setTimeout(() => {
			setStatus("stalled");
		}, timeoutMs);

		return () => clearTimeout(timer);
	}, [status, timeoutMs]);

	const handleLoad = () => {
		setStatus("loaded");
	};

	const handleError = () => {
		setStatus("error");
	};

	const isLoaded = status === "loaded";
	const hasExplicitHeight =
		style.height !== undefined && style.height !== "auto";
	const hasExplicitWidth = style.width !== undefined && style.width !== "auto";

	const currentMinHeight = computeDimension(
		isLoaded,
		hasExplicitHeight,
		style.minHeight,
		minHeight,
	);
	const currentMinWidth = computeDimension(
		isLoaded,
		hasExplicitWidth,
		style.minWidth,
		minWidth,
	);

	const containerStyle: React.CSSProperties = {
		display,
		...style,
		minHeight: currentMinHeight,
		minWidth: currentMinWidth,
	};

	return (
		<div
			className={`relative overflow-hidden ${className}`}
			style={containerStyle}
		>
			{children({
				onLoad: handleLoad,
				onError: handleError,
				style: {
					opacity: isLoaded ? 1 : 0,
					transition: "opacity 0.3s ease-in-out",
				},
				status,
			})}

			<MediaOverlay
				status={status}
				lang={lang}
				alt={alt}
				sizePreset={sizePreset}
			/>
		</div>
	);
};
