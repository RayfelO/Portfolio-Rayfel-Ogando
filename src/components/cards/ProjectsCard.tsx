import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import { BookOpen, Globe, Image as ImageIcon, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type Project, privateProjects, projects } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { GithubIcon } from "../icons/GithubIcon";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";
import { LoadingMedia } from "../media/LoadingMedia";
import { OptimizedYouTubePlayer } from "../OptimizedYouTubePlayer";
import {
	MarkdownRenderer,
	type ResolvedReadme,
} from "../projects/MarkdownRenderer";

interface ProjectsCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
	className?: string;
}

type TabType = "open-source" | "private";
type MediaLayout = "video-hero" | "image-hero" | "single-focus";
type LightboxInstance = ReturnType<typeof GLightbox>;

interface LightboxElement {
	href: string;
	type: "image" | "video";
	videoProvider?: "youtube";
	title?: string;
	description?: string;
	alt?: string;
}

interface GallerySlide {
	src: string;
	width: number;
	height: number;
}

interface MediaItemImage {
	kind: "image";
	slide: GallerySlide;
}

interface MediaItemVideo {
	kind: "video";
	videoUrl: string;
}

type MediaItem = MediaItemImage | MediaItemVideo;

const imageSizesByProject: Record<
	string,
	Array<{ width: number; height: number }>
> = {
	avaluo: [
		{ width: 1920, height: 1080 },
		{ width: 1900, height: 925 },
		{ width: 580, height: 835 },
	],
	emmax: [
		{ width: 1900, height: 925 },
		{ width: 1900, height: 925 },
	],
	calculator: [{ width: 1920, height: 995 }],
	apihotel: [{ width: 1898, height: 1587 }],
	estudiantes: [
		{ width: 1798, height: 925 },
		{ width: 1082, height: 775 },
		{ width: 1078, height: 775 },
		{ width: 1072, height: 775 },
	],
	"four-e-technologys": [
		{ width: 1891, height: 881 },
		{ width: 1891, height: 882 },
		{ width: 1897, height: 873 },
	],
	"cs-asesorias": [
		{ width: 1918, height: 745 },
		{ width: 1896, height: 870 },
		{ width: 1918, height: 880 },
	],
};

const mediaTileBase =
	"group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/30 transition-all duration-200 hover:border-[var(--border-hover)]";

const mediaTileOverlay = "projects-media-overlay";

const getProjectDateText = (project: Project, lang: "en" | "es") => {
	const start = lang === "es" ? project.startDateEs : project.startDateEn;
	const end = lang === "es" ? project.endDateEs : project.endDateEn;
	return end ? `${start} - ${end}` : start;
};

const buildGallerySlides = (project: Project): GallerySlide[] => {
	const sizes = imageSizesByProject[project.id] ?? [];
	return project.images.map((src, index) => {
		const size = sizes[index] ?? { width: 1600, height: 900 };
		return { src, width: size.width, height: size.height };
	});
};

const getYouTubeId = (url: string) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

const getLightboxVideoUrl = (url: string) => {
	const videoId = getYouTubeId(url);
	return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
};

const normalizeBaseUrl = (url: string) => (url.endsWith("/") ? url : `${url}/`);

const getDirectoryPath = (path: string) => {
	const normalizedPath = path.replace(/^\/+/, "");
	const segments = normalizedPath.split("/");
	segments.pop();
	return segments.length > 0 ? `${segments.join("/")}/` : "";
};

const parseGithubRepo = (githubUrl: string) => {
	try {
		const url = new URL(githubUrl);
		if (url.hostname !== "github.com") return null;

		const parts = url.pathname.split("/").filter(Boolean);
		if (parts.length < 2) return null;

		return {
			owner: parts[0],
			repo: parts[1],
		};
	} catch {
		return null;
	}
};

const createReadmeCandidate = (
	owner: string,
	repo: string,
	branch: string,
	directory: string,
	rawUrl: string,
): ResolvedReadme => ({
	rawUrl,
	rawBaseUrl: normalizeBaseUrl(
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${directory}`,
	),
	blobBaseUrl: normalizeBaseUrl(
		`https://github.com/${owner}/${repo}/blob/${branch}/${directory}`,
	),
	source: "remote",
});

const createRepoCandidate = (
	owner: string,
	repo: string,
	branch: string,
	fileName: string,
): ResolvedReadme => ({
	rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileName}`,
	rawBaseUrl: normalizeBaseUrl(
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`,
	),
	blobBaseUrl: normalizeBaseUrl(
		`https://github.com/${owner}/${repo}/blob/${branch}/`,
	),
	source: "remote",
});

const parseReadmeUrl = (readmeUrl: string): ResolvedReadme | null => {
	try {
		const rawUrl = new URL(readmeUrl);
		const parts = rawUrl.pathname.split("/").filter(Boolean);
		if (rawUrl.hostname !== "raw.githubusercontent.com" || parts.length < 4)
			return null;
		const [owner, repo, branch, ...pathParts] = parts;
		const directory = getDirectoryPath(pathParts.join("/"));
		return createReadmeCandidate(owner, repo, branch, directory, readmeUrl);
	} catch {
		return null;
	}
};

const createBranchCandidates = (
	owner: string,
	repo: string,
	existingCandidates: ResolvedReadme[],
): ResolvedReadme[] => {
	const candidates: ResolvedReadme[] = [];
	for (const branch of ["main", "master"]) {
		for (const fileName of ["README.md", "README.MD"]) {
			const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileName}`;
			if (existingCandidates.some((c) => c.rawUrl === rawUrl)) continue;
			candidates.push(createRepoCandidate(owner, repo, branch, fileName));
		}
	}
	return candidates;
};

const buildReadmeCandidates = (project: Project): ResolvedReadme[] => {
	const repoInfo = parseGithubRepo(project.githubUrl as string);
	const parsed = project.readmeUrl ? parseReadmeUrl(project.readmeUrl) : null;
	const candidates: ResolvedReadme[] = parsed ? [parsed] : [];
	if (!repoInfo) return candidates;
	candidates.push(
		...createBranchCandidates(repoInfo.owner, repoInfo.repo, candidates),
	);
	return candidates;
};

const tryFetch = async (url: string, method: string, signal?: AbortSignal) => {
	try {
		return await fetch(url, { method, signal } as RequestInit);
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			throw error;
		return null;
	}
};

const validateRemoteReadme = async (rawUrl: string, signal?: AbortSignal) => {
	const headRes = await tryFetch(rawUrl, "HEAD", signal);
	if (headRes !== null) {
		if (headRes.ok) return true;
		return headRes.status === 405;
	}
	const getRes = await tryFetch(rawUrl, "GET", signal);
	return getRes?.ok === true;
};

const resolveRemoteReadme = async (
	project: Project,
	signal?: AbortSignal,
): Promise<ResolvedReadme | null> => {
	for (const candidate of buildReadmeCandidates(project)) {
		if (await validateRemoteReadme(candidate.rawUrl, signal)) {
			return candidate;
		}
	}

	return null;
};

const getSlideOrientation = (slide: GallerySlide) => {
	const ratio = slide.width / slide.height;
	if (ratio > 1.15) return "wide";
	if (ratio < 0.9) return "tall";
	return "balanced";
};

const buildMediaItems = (project: Project): MediaItem[] => {
	const slides = buildGallerySlides(project);
	const orderedSlides =
		project.id === "avaluo" && slides.length >= 3
			? [slides[2], slides[0], slides[1]]
			: [...slides].sort((left, right) => {
					const leftOrientation = getSlideOrientation(left);
					const rightOrientation = getSlideOrientation(right);
					const score = (orientation: string) => {
						if (orientation === "wide") return 2;
						if (orientation === "balanced") return 1;
						return 0;
					};

					return score(rightOrientation) - score(leftOrientation);
				});

	const items: MediaItem[] = orderedSlides.map((slide) => ({
		kind: "image",
		slide,
	}));

	if (project.youtubeUrl) {
		items.unshift({
			kind: "video",
			videoUrl: project.youtubeUrl,
		});
	}

	return items;
};

const getMediaLayout = (items: MediaItem[]): MediaLayout => {
	if (items[0]?.kind === "video") return "video-hero";
	if (items.length === 1) return "single-focus";
	return "image-hero";
};

const HERO_FIRST_CLASS =
	"sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
const SINGLE_IMAGE_CLASS =
	"sm:col-span-1 lg:col-span-2 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
const DEFAULT_TILE_CLASS =
	"sm:col-span-1 lg:col-span-2 lg:row-span-1 min-h-[140px] sm:min-h-[164px]";
const FULL_SPAN_CLASS =
	"sm:col-span-3 lg:col-span-6 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";

const avaluoTileClassMap: Record<string, string> = {
	"0:video": HERO_FIRST_CLASS,
	"1:image": SINGLE_IMAGE_CLASS,
};

const getAvaluoTileClass = (index: number, item: MediaItem) =>
	avaluoTileClassMap[`${index}:${item.kind}`] ?? DEFAULT_TILE_CLASS;

const heroFirstKinds = new Set(["video-hero:video", "image-hero:image"]);

const isHeroFirstCheck = (
	layout: MediaLayout,
	item: MediaItem,
	index: number,
): boolean => index === 0 && heroFirstKinds.has(`${layout}:${item.kind}`);

const getProjectSpecificClass = (
	projectId: string,
	layout: MediaLayout,
	index: number,
	item: MediaItem,
): string | undefined => {
	if (projectId === "emmax")
		return "aspect-[24/7] min-h-[140px] sm:min-h-[160px]";
	if (projectId === "avaluo" && layout === "video-hero")
		return getAvaluoTileClass(index, item);
	return undefined;
};

const getTileClassName = (
	projectId: string,
	layout: MediaLayout,
	item: MediaItem,
	index: number,
) => {
	const projectClass = getProjectSpecificClass(projectId, layout, index, item);
	if (projectClass) return projectClass;
	if (layout === "single-focus") return FULL_SPAN_CLASS;
	if (isHeroFirstCheck(layout, item, index)) return HERO_FIRST_CLASS;
	return DEFAULT_TILE_CLASS;
};

const getCollageGridClassName = (projectId: string) => {
	if (projectId === "emmax") {
		return "grid grid-cols-1 gap-2";
	}

	return "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:auto-rows-[164px]";
};

const buildLightboxElements = (
	project: Project,
	items: MediaItem[],
): LightboxElement[] => {
	return items.map((item) => {
		if (item.kind === "video") {
			return {
				href: getLightboxVideoUrl(item.videoUrl),
				type: "video",
				videoProvider: "youtube",
				title: project.name,
				description: "Video demo",
			};
		}

		return {
			href: item.slide.src,
			type: "image",
			title: project.name,
			alt: `${project.name} preview`,
			description: "Preview image",
		};
	});
};

const VideoHeroTile: React.FC<{
	projectName: string;
	youtubeUrl: string;
	onOpen: () => void;
	className: string;
	lang: "en" | "es";
}> = ({ projectName, youtubeUrl, onOpen, className, lang }) => {
	return (
		<button
			type="button"
			onClick={onOpen}
			className={`${mediaTileBase} ${className} text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50`}
		>
			<div className="absolute inset-0 overflow-hidden rounded-xl">
				<OptimizedYouTubePlayer
					youtubeUrl={youtubeUrl}
					projectName={projectName}
					muted
					autoplay
					showControls={false}
					className="pointer-events-none"
					fit="cover"
					lang={lang}
				/>
				<div className={mediaTileOverlay} />
				<div className="absolute right-3 bottom-3 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 p-2 text-white/90">
					<Play size={14} fill="currentColor" />
				</div>
			</div>
		</button>
	);
};

const ImageTile: React.FC<{
	projectName: string;
	image: GallerySlide;
	className: string;
	onOpen: () => void;
	lang: "en" | "es";
}> = ({ projectName, image, className, onOpen, lang }) => {
	return (
		<button
			type="button"
			onClick={onOpen}
			className={`${mediaTileBase} rounded-lg ${className} focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50`}
		>
			<div className="absolute inset-0 p-1.5">
				<div className="relative h-full w-full overflow-hidden rounded-md border border-white/5 bg-[var(--bg-card)]/80">
					<LoadingMedia
						lang={lang}
						alt={`${projectName} preview`}
						className="absolute inset-0 h-full w-full"
					>
						{({ onLoad, onError, style }) => (
							<img
								src={image.src}
								alt={`${projectName} preview`}
								className="absolute inset-0 h-full w-full select-none object-cover object-left-top"
								style={style}
								onLoad={onLoad}
								onError={onError}
								loading="lazy"
							/>
						)}
					</LoadingMedia>
					<div className={mediaTileOverlay} />
					<div className="absolute right-3 bottom-3 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 p-2 text-white/90">
						<ImageIcon size={14} />
					</div>
				</div>
			</div>
		</button>
	);
};

const MediaGrid: React.FC<{
	project: Project;
	items: MediaItem[];
	layout: MediaLayout;
	onOpen: (index: number) => void;
	lang: "en" | "es";
}> = ({ project, items, layout, onOpen, lang }) => (
	<div className={getCollageGridClassName(project.id)}>
		{items.map((item, index) => {
			const className = getTileClassName(project.id, layout, item, index);
			if (item.kind === "video") {
				return (
					<VideoHeroTile
						key={`${project.id}-video`}
						projectName={project.name}
						youtubeUrl={item.videoUrl}
						onOpen={() => onOpen(index)}
						className={className}
						lang={lang}
					/>
				);
			}
			return (
				<ImageTile
					key={item.slide.src}
					projectName={project.name}
					image={item.slide}
					className={className}
					onOpen={() => onOpen(index)}
					lang={lang}
				/>
			);
		})}
	</div>
);

const MediaCollage: React.FC<{
	project: Project;
	lang: "en" | "es";
}> = ({ project, lang }) => {
	const items = useMemo(() => buildMediaItems(project), [project]);
	const lightboxElements = useMemo(
		() => buildLightboxElements(project, items),
		[project, items],
	);
	const layout = getMediaLayout(items);
	const lightboxRef = useRef<LightboxInstance | null>(null);

	useEffect(() => {
		const lightbox = GLightbox({
			elements: lightboxElements as unknown as [],
			openEffect: "zoom",
			closeEffect: "fade",
			slideEffect: "slide",
			touchNavigation: true,
			keyboardNavigation: true,
			closeOnOutsideClick: true,
			autoplayVideos: true,
			loop: false,
			zoomable: true,
			draggable: true,
			width: "92vw",
			height: "78vh",
			videosWidth: "92vw",
			descPosition: "bottom",
		});
		lightboxRef.current = lightbox;
		return () => {
			lightbox.destroy();
			lightboxRef.current = null;
		};
	}, [lightboxElements]);

	const openLightboxAt = (index: number) => {
		lightboxRef.current?.openAt(index);
	};

	return (
		<MediaGrid
			project={project}
			items={items}
			layout={layout}
			onOpen={openLightboxAt}
			lang={lang}
		/>
	);
};

interface LinkCardProps {
	href?: string;
	onClick?: () => void;
	icon: React.ReactNode;
	label: string;
	title: string;
	className?: string;
}

const LinkCard: React.FC<LinkCardProps> = ({
	href,
	onClick,
	icon,
	label,
	title,
	className = "",
}) => {
	const content = (
		<>
			<div className="text-secondary group-hover:text-primary transition-colors animate-fade-in">
				{icon}
			</div>
			<div>
				<span className="block font-mono text-[10px] text-muted uppercase tracking-wider mb-0.5">
					{label}
				</span>
				<span className="block text-[13.5px] font-semibold text-primary truncate">
					{title}
				</span>
			</div>
		</>
	);

	const baseClass = `flex flex-col justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl hover:border-[var(--accent-brand)]/40 hover:bg-[var(--bg-card-hover)] text-left h-[105px] cursor-pointer group ${className}`;
	const hoverTapProps = {
		whileHover: { y: -3, scale: 1.01 },
		whileTap: { scale: 0.99 },
		transition: { type: "spring" as const, stiffness: 450, damping: 20 },
	};

	if (href) {
		return (
			<motion.a
				{...hoverTapProps}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={baseClass}
			>
				{content}
			</motion.a>
		);
	}

	return (
		<motion.button
			{...hoverTapProps}
			type="button"
			onClick={onClick}
			className={baseClass}
		>
			{content}
		</motion.button>
	);
};

interface ReadmeModalProps {
	project: Project | null;
	readme: ResolvedReadme | null;
	readmeText: string;
	loading: boolean;
	lang: "en" | "es";
	onClose: () => void;
}

const ReadmeHeader: React.FC<{
	project: Project;
	readme: ResolvedReadme | null;
	onClose: () => void;
}> = ({ project, readme, onClose }) => (
	<div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--border-default)] select-none gap-3">
		<div className="flex items-center gap-2">
			<BookOpen size={18} className="text-secondary" />
			<span className="font-mono text-[14.5px] font-bold text-primary">
				{project.name} -{" "}
				{readme?.source === "remote" ? "README.md" : "DOCUMENTACION"}
			</span>
		</div>
		<button
			type="button"
			onClick={onClose}
			className="text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
		>
			<X size={18} />
		</button>
	</div>
);

const ReadmeSpinner: React.FC<{ lang: "en" | "es" }> = ({ lang }) => (
	<div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
		<div className="w-8 h-8 rounded-full border-[3px] border-[var(--border-default)] border-t-[var(--accent-light)] animate-spin" />
		<span className="font-mono text-[13px] text-secondary">
			{lang === "es" ? "Cargando archivo..." : "Loading document..."}
		</span>
	</div>
);

const ReadmeModal: React.FC<ReadmeModalProps> = ({
	project,
	readme,
	readmeText,
	loading,
	lang,
	onClose,
}) => {
	useEffect(() => {
		if (!project) return;

		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = overflow;
		};
	}, [project]);

	if (!project) return null;

	return createPortal(
		<AnimatePresence>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click closes modal */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes modal */}
			<div
				onClick={onClose}
				className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-8"
			>
				<motion.div
					onClick={(e) => e.stopPropagation()}
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 15 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
					className="bg-[var(--bg-card)] border border-[var(--border-hover)] rounded-xl w-full max-w-[800px] max-h-[85dvh] h-[80dvh] flex flex-col overflow-hidden shadow-2xl relative"
				>
					<ReadmeHeader project={project} readme={readme} onClose={onClose} />

					<div
						data-lenis-prevent
						className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar"
					>
						{loading ? (
							<ReadmeSpinner lang={lang} />
						) : (
							<MarkdownRenderer
								content={readmeText}
								readme={readme}
								lang={lang}
							/>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>,
		document.body,
	);
};

interface ProjectSelectorProps {
	activeProjects: Project[];
	activeProjectId: string;
	onSelect: (id: string, name: string) => void;
	lang: "en" | "es";
}

interface ProjectListItemProps {
	project: Project;
	isActive: boolean;
	isMobile: boolean;
	lang: "en" | "es";
	onSelect: (id: string, name: string) => void;
}

const ITEM_BASE_CLASSES: Record<string, string> = {
	mobile:
		"relative w-full px-3 py-2.5 rounded-xl border flex flex-col gap-0.5 cursor-pointer text-left overflow-hidden transition-all duration-150",
	desktop:
		"relative w-full text-left px-3.5 py-2.5 rounded-lg flex flex-col gap-1 cursor-pointer border select-none overflow-hidden transition-all duration-150",
};

const ITEM_STATE_CLASSES: Record<string, string> = {
	"true:true": "border-transparent text-primary font-medium",
	"true:false": "border-transparent text-primary font-semibold shadow-xs",
	"false:true":
		"border-[var(--border-default)] text-secondary hover:text-primary hover:bg-[var(--bg-subtle)]/40 hover:border-[var(--border-hover)]",
	"false:false":
		"border-transparent text-secondary hover:text-primary hover:bg-[var(--bg-subtle)]/30 hover:border-[var(--border-default)]",
};

const getItemClassName = (isActive: boolean, isMobile: boolean): string => {
	const base = ITEM_BASE_CLASSES[isMobile ? "mobile" : "desktop"];
	const state = ITEM_STATE_CLASSES[`${isActive}:${isMobile}`];
	return `${base} ${state}`;
};

const DOT_SIZE_CLASSES: Record<string, string> = {
	mobile: "w-1.5 h-1.5 rounded-full border projects-index-dot",
	desktop: "w-2 h-2 rounded-full flex-shrink-0 border projects-index-dot",
};

const DOT_STATE_CLASSES: Record<string, string> = {
	"true:true":
		"bg-[var(--accent-brand)] border-[var(--accent-brand)] scale-110",
	"true:false":
		"bg-[var(--accent-brand)] border-[var(--accent-brand)] scale-110 shadow-[0_0_8px_rgba(43,69,136,0.55)]",
	"false:true": "bg-transparent border-[var(--projects-index-dot-border)]",
	"false:false": "bg-transparent border-[var(--projects-index-dot-border)]",
};

const getDotClassName = (isActive: boolean, isMobile: boolean): string => {
	const size = DOT_SIZE_CLASSES[isMobile ? "mobile" : "desktop"];
	const state = DOT_STATE_CLASSES[`${isActive}:${isMobile}`];
	return `${size} ${state}`;
};

const LAYOUT_IDS: Record<string, string> = {
	mobile: "activeProjectChipHighlight",
	desktop: "activeProjectListHighlight",
};

const BG_CLASSES: Record<string, string> = {
	mobile:
		"absolute inset-0 bg-[var(--bg-card)] border border-[var(--projects-index-highlight-border)] rounded-xl -z-0",
	desktop:
		"absolute inset-0 bg-[var(--bg-card)] border border-[var(--projects-index-highlight-border)] rounded-lg -z-0",
};

const FLEX_CLASSES: Record<string, string> = {
	mobile: "relative z-10 flex items-center gap-1.5 text-[12.5px]",
	desktop: "relative z-10 flex items-center gap-2.5 min-w-0 w-full",
};

const DATE_CLASSES: Record<string, string> = {
	mobile: "relative z-10 text-[9.5px] font-mono text-muted mt-0.5",
	desktop: "relative z-10 pl-4.5 text-[10px] font-mono text-muted",
};

const NAME_CLASSES: Record<string, string> = {
	mobile: "truncate block text-[12.5px] font-medium",
	desktop: "truncate text-[13.5px] font-bold",
};

const ProjectListItem: React.FC<ProjectListItemProps> = ({
	project,
	isActive,
	isMobile,
	lang,
	onSelect,
}) => {
	const mode = isMobile ? "mobile" : "desktop";
	return (
		<button
			type="button"
			onClick={() => onSelect(project.id, project.name)}
			className={getItemClassName(isActive, isMobile)}
		>
			{isActive && (
				<motion.div
					layoutId={LAYOUT_IDS[mode]}
					className={BG_CLASSES[mode]}
					transition={{ type: "spring", stiffness: 350, damping: 30 }}
				/>
			)}
			<div className={FLEX_CLASSES[mode]}>
				<span className={getDotClassName(isActive, isMobile)} />
				<span className={NAME_CLASSES[mode]}>{project.name}</span>
			</div>
			<div className={DATE_CLASSES[mode]}>
				{getProjectDateText(project, lang)}
			</div>
		</button>
	);
};

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
	activeProjects,
	activeProjectId,
	onSelect,
	lang,
}) => (
	<>
		<div className="grid grid-cols-2 md:hidden gap-2 pb-1 select-none w-full">
			{activeProjects.map((project) => (
				<ProjectListItem
					key={project.id}
					project={project}
					isActive={project.id === activeProjectId}
					isMobile
					lang={lang}
					onSelect={onSelect}
				/>
			))}
		</div>
		<div className="hidden md:flex flex-col gap-1.5 mt-1 relative">
			{activeProjects.map((project) => (
				<ProjectListItem
					key={project.id}
					project={project}
					isActive={project.id === activeProjectId}
					isMobile={false}
					lang={lang}
					onSelect={onSelect}
				/>
			))}
		</div>
	</>
);

const countCards = (
	showGithub: boolean,
	showLive: boolean,
	showReadme: boolean,
): number => {
	let count = 0;
	if (showGithub) count++;
	if (showLive) count++;
	if (showReadme) count++;
	return count;
};

const getDescription = (project: Project, lang: "en" | "es") =>
	lang === "es" ? project.descriptionEs : project.descriptionEn;

const getGithubLinkProps = (
	project: Project,
	lang: "en" | "es",
): LinkCardProps | null =>
	project.githubUrl
		? {
				href: project.githubUrl,
				icon: <GithubIcon size={18} />,
				label: "GitHub",
				title: lang === "es" ? "Codigo fuente" : "Source code",
			}
		: null;

const getLiveLinkProps = (
	project: Project,
	lang: "en" | "es",
): LinkCardProps | null =>
	project.liveUrl
		? {
				href: project.liveUrl,
				icon: <Globe size={18} />,
				label: lang === "es" ? "Despliegue" : "Deployment",
				title: lang === "es" ? "Visitar sitio" : "Visit site",
			}
		: null;

const getReadmeLinkProps = (
	project: Project,
	readmeLabel: string,
	onOpenReadme: (project: Project) => void,
): LinkCardProps => ({
	onClick: () => onOpenReadme(project),
	icon: <BookOpen size={18} />,
	label: "Markdown",
	title: readmeLabel,
});

const LINK_COLS_CLASSES: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
};

const getLinkGridClass = (cardsLength: number): string =>
	LINK_COLS_CLASSES[cardsLength] ?? "grid-cols-1 sm:grid-cols-3";

interface LinkCardsProps {
	showGithub: boolean;
	showLive: boolean;
	showReadme: boolean;
	project: Project;
	lang: "en" | "es";
	readmeLabel: string;
	onOpenReadme: (project: Project) => void;
}

const LinkCards: React.FC<LinkCardsProps> = ({
	showGithub: _showGithub,
	showLive: _showLive,
	showReadme,
	project,
	lang,
	readmeLabel,
	onOpenReadme,
}) => {
	const cards = [
		getGithubLinkProps(project, lang),
		getLiveLinkProps(project, lang),
		showReadme ? getReadmeLinkProps(project, readmeLabel, onOpenReadme) : null,
	].filter((c): c is LinkCardProps => c !== null);

	return (
		<div
			className={`sm:col-span-6 grid gap-3 ${getLinkGridClass(cards.length)}`}
		>
			{cards.map((card) => (
				<LinkCard key={card.title} {...card} />
			))}
		</div>
	);
};

interface ProjectBentoPreviewProps {
	project: Project;
	lang: "en" | "es";
	onOpenReadme: (project: Project) => void;
	showReadme: boolean;
	readmeLabel: string;
}

const ProjectBentoPreview: React.FC<ProjectBentoPreviewProps> = ({
	project,
	lang,
	onOpenReadme,
	showReadme,
	readmeLabel,
}) => {
	const showGithub = !!project.githubUrl;
	const showLive = !!project.liveUrl;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
			<div className="sm:col-span-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 flex flex-col justify-between gap-4 text-left">
				<div>
					<h3 className="text-[17px] font-bold text-primary tracking-tight">
						{project.name}
					</h3>
					<span className="block font-mono text-[11px] text-muted mb-2 animate-fade-in">
						{getProjectDateText(project, lang)}
					</span>
					<p className="text-[14.5px] text-secondary leading-relaxed">
						{getDescription(project, lang)}
					</p>
				</div>
				<div className="flex flex-wrap gap-1.5 mt-2">
					{project.languages.map((langItem) => (
						<span
							key={langItem}
							className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-secondary select-none"
						>
							{langItem}
						</span>
					))}
				</div>
			</div>

			<div className="sm:col-span-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl relative p-3 md:p-4">
				<MediaCollage project={project} lang={lang} />
			</div>

			{countCards(showGithub, showLive, showReadme) > 0 && (
				<LinkCards
					showGithub={showGithub}
					showLive={showLive}
					showReadme={showReadme}
					project={project}
					lang={lang}
					readmeLabel={readmeLabel}
					onOpenReadme={onOpenReadme}
				/>
			)}
		</div>
	);
};

interface ProjectTabSwitcherProps {
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	openSourceLabel: string;
	privateLabel: string;
}

const TabButton: React.FC<{
	label: string;
	isActive: boolean;
	onClick: () => void;
}> = ({ label, isActive, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		className="relative flex-1 py-1.5 text-[12.5px] font-bold cursor-pointer text-center flex items-center justify-center"
	>
		{isActive && (
			<motion.div
				layoutId="activeProjectCategoryBackground"
				className="absolute inset-0 bg-[var(--accent)] rounded-md z-0"
				transition={{ type: "spring", stiffness: 380, damping: 30 }}
			/>
		)}
		<span
			className={`relative z-10 transition-colors ${isActive ? "text-[var(--accent-text)]" : "text-secondary hover:text-primary"}`}
		>
			{label}
		</span>
	</button>
);

const ProjectTabSwitcher: React.FC<ProjectTabSwitcherProps> = ({
	activeTab,
	onTabChange,
	openSourceLabel,
	privateLabel,
}) => (
	<div className="flex bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-0.5 w-full select-none relative">
		<TabButton
			label={openSourceLabel}
			isActive={activeTab === "open-source"}
			onClick={() => onTabChange("open-source")}
		/>
		<TabButton
			label={privateLabel}
			isActive={activeTab === "private"}
			onClick={() => onTabChange("private")}
		/>
	</div>
);

const getHasReadme = (
	activeTab: TabType,
	lang: "en" | "es",
	resolvedReadme: ResolvedReadme | null | undefined,
	project: Project,
): boolean =>
	activeTab === "open-source"
		? resolvedReadme !== undefined && resolvedReadme !== null
		: !!(lang === "es" ? project.readmeContentEs : project.readmeContentEn);

const getReadmeLabel = (activeTab: TabType, lang: "en" | "es"): string => {
	if (activeTab === "open-source") {
		return lang === "es" ? "Ver README" : "View README";
	}
	return lang === "es" ? "Ver Documentacion" : "View Docs";
};

const getMissingReadmeCopy = (lang: "en" | "es") =>
	lang === "es"
		? "# README no disponible\n\nNo se encontro un README remoto valido para este repositorio."
		: "# README unavailable\n\nNo valid remote README was found for this repository.";

const getFetchErrorCopy = (name: string, lang: "en" | "es") =>
	lang === "es"
		? `# ${name}\n\nNo se pudo descargar el archivo README desde GitHub en este momento.`
		: `# ${name}\n\nThe README could not be downloaded from GitHub right now.`;

const useReadmeResolution = (
	activeTab: TabType,
	currentActiveProject: Project,
): Record<string, ResolvedReadme | null | undefined> => {
	const [resolvedReadmes, setResolvedReadmes] = useState<
		Record<string, ResolvedReadme | null | undefined>
	>({});

	useEffect(() => {
		if (activeTab !== "open-source" || !currentActiveProject.githubUrl) return;
		if (resolvedReadmes[currentActiveProject.id] !== undefined) return;
		const controller = new AbortController();
		resolveRemoteReadme(currentActiveProject, controller.signal)
			.then((resolvedReadme) => {
				setResolvedReadmes((prev) => ({
					...prev,
					[currentActiveProject.id]: resolvedReadme,
				}));
			})
			.catch((error) => {
				if (error instanceof DOMException && error.name === "AbortError")
					return;
				setResolvedReadmes((prev) => ({
					...prev,
					[currentActiveProject.id]: null,
				}));
			});
		return () => controller.abort();
	}, [activeTab, currentActiveProject, resolvedReadmes]);

	return resolvedReadmes;
};

const useProjectNavigation = () => {
	const [activeTab, setActiveTab] = useState<TabType>("open-source");
	const activeProjects =
		activeTab === "open-source" ? projects : privateProjects;
	const [activeProjectId, setActiveProjectId] = useState<string>(
		activeProjects[0].id,
	);

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		setActiveProjectId(
			(tab === "open-source" ? projects : privateProjects)[0].id,
		);
		track.contactClicked(`tab_${tab}`);
	};

	const currentActiveProject = activeProjects.find(
		(p) => p.id === activeProjectId,
	) as Project;

	return {
		activeTab,
		activeProjects,
		activeProjectId,
		setActiveProjectId,
		handleTabChange,
		currentActiveProject,
	};
};

const loadRemoteReadme = async (
	project: Project,
	resolvedReadmes: Record<string, ResolvedReadme | null | undefined>,
	lang: "en" | "es",
	setReadmeText: (v: string) => void,
	setSelectedReadme: (v: ResolvedReadme | null) => void,
	setLoadingReadme: (v: boolean) => void,
) => {
	const resolvedReadme = resolvedReadmes[project.id];
	if (!resolvedReadme) {
		setReadmeText(getMissingReadmeCopy(lang));
		setLoadingReadme(false);
		return;
	}
	try {
		const res = await fetch(resolvedReadme.rawUrl);
		if (!res.ok) throw new Error("Fail to load README");
		setReadmeText(await res.text());
		setSelectedReadme(resolvedReadme);
	} catch {
		setReadmeText(getFetchErrorCopy(project.name, lang));
	}
	setLoadingReadme(false);
};

const loadEmbeddedReadme = (
	project: Project,
	lang: "en" | "es",
	setReadmeText: (v: string) => void,
	setSelectedReadme: (v: ResolvedReadme | null) => void,
	setLoadingReadme: (v: boolean) => void,
) => {
	const content =
		lang === "es" ? project.readmeContentEs : project.readmeContentEn;
	setReadmeText(content || "");
	setSelectedReadme({
		rawUrl: "",
		rawBaseUrl: "",
		blobBaseUrl: "",
		source: "embedded",
	});
	setLoadingReadme(false);
};

interface ReadmeModalState {
	selectedProject: Project | null;
	readmeText: string;
	loadingReadme: boolean;
	selectedReadme: ResolvedReadme | null;
	handleOpenReadme: (project: Project) => void;
	closeReadme: () => void;
}

const useReadmeModal = (
	lang: "en" | "es",
	activeTab: TabType,
	resolvedReadmes: Record<string, ResolvedReadme | null | undefined>,
): ReadmeModalState => {
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [readmeText, setReadmeText] = useState<string>("");
	const [loadingReadme, setLoadingReadme] = useState<boolean>(false);
	const [selectedReadme, setSelectedReadme] = useState<ResolvedReadme | null>(
		null,
	);

	const handleOpenReadme = (project: Project) => {
		setSelectedProject(project);
		setLoadingReadme(true);
		setSelectedReadme(null);
		track.projectClicked(project.name);
		if (activeTab === "open-source") {
			loadRemoteReadme(
				project,
				resolvedReadmes,
				lang,
				setReadmeText,
				setSelectedReadme,
				setLoadingReadme,
			);
		} else {
			loadEmbeddedReadme(
				project,
				lang,
				setReadmeText,
				setSelectedReadme,
				setLoadingReadme,
			);
		}
	};

	const closeReadme = () => setSelectedProject(null);

	return {
		selectedProject,
		readmeText,
		loadingReadme,
		selectedReadme,
		handleOpenReadme,
		closeReadme,
	};
};

const ProjectsCardHeader: React.FC<{
	title: string;
	count: number;
	lang: "en" | "es";
}> = ({ title, count, lang }) => (
	<div className="flex justify-between items-center pb-2.5 border-b border-[var(--projects-card-border)] select-none">
		<h2 className="text-[15.5px] font-bold uppercase tracking-wider text-primary">
			{title}
		</h2>
		<span className="font-mono text-[14.5px] text-secondary">
			{count} {lang === "es" ? "proyectos" : "projects"}
		</span>
	</div>
);

const ProjectsCardMain: React.FC<{
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	t: Translations;
	lang: "en" | "es";
	activeProjects: Project[];
	activeProjectId: string;
	onSelectProject: (id: string, name: string) => void;
	currentActiveProject: Project;
	showReadme: boolean;
	readmeLabel: string;
	onOpenReadme: (project: Project) => void;
}> = ({
	activeTab,
	onTabChange,
	t,
	lang,
	activeProjects,
	activeProjectId,
	onSelectProject,
	currentActiveProject,
	showReadme,
	readmeLabel,
	onOpenReadme,
}) => (
	<div className="flex-1 flex flex-col md:flex-row gap-6">
		<div className="w-full md:w-[220px] lg:w-[240px] flex-shrink-0 flex flex-col gap-4">
			<ProjectTabSwitcher
				activeTab={activeTab}
				onTabChange={onTabChange}
				openSourceLabel={t.projects.openSourceTab}
				privateLabel={t.projects.privateTab}
			/>
			<ProjectSelector
				activeProjects={activeProjects}
				activeProjectId={activeProjectId}
				lang={lang}
				onSelect={onSelectProject}
			/>
		</div>

		<div className="hidden md:block w-[0.5px] bg-[var(--projects-card-border)] self-stretch" />

		<div className="flex-1 flex flex-col gap-3 min-h-0 md:min-h-[400px]">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentActiveProject.id}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
				>
					<ProjectBentoPreview
						project={currentActiveProject}
						lang={lang}
						onOpenReadme={onOpenReadme}
						showReadme={showReadme}
						readmeLabel={readmeLabel}
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	</div>
);
export const ProjectsCard: React.FC<ProjectsCardProps> = ({
	id,
	t,
	lang,
	className = "",
}) => {
	const nav = useProjectNavigation();
	const resolvedReadmes = useReadmeResolution(
		nav.activeTab,
		nav.currentActiveProject,
	);
	const readmeModal = useReadmeModal(lang, nav.activeTab, resolvedReadmes);
	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...(readmeModal.selectedProject ? {} : cardHoverProps)}
			className={`bento-card bento-card--brand-blue bento-col-4 flex flex-col gap-5 overflow-visible ${className}`}
		>
			<ProjectsCardHeader
				title={t.sections.projects}
				count={nav.activeProjects.length}
				lang={lang}
			/>
			<ProjectsCardMain
				activeTab={nav.activeTab}
				onTabChange={nav.handleTabChange}
				t={t}
				lang={lang}
				activeProjects={nav.activeProjects}
				activeProjectId={nav.activeProjectId}
				onSelectProject={(projectId, name) => {
					nav.setActiveProjectId(projectId);
					track.projectClicked(name);
				}}
				currentActiveProject={nav.currentActiveProject}
				showReadme={getHasReadme(
					nav.activeTab,
					lang,
					resolvedReadmes[nav.currentActiveProject.id],
					nav.currentActiveProject,
				)}
				readmeLabel={getReadmeLabel(nav.activeTab, lang)}
				onOpenReadme={readmeModal.handleOpenReadme}
			/>
			<ReadmeModal
				project={readmeModal.selectedProject}
				readme={readmeModal.selectedReadme}
				readmeText={readmeModal.readmeText}
				loading={readmeModal.loadingReadme}
				lang={lang}
				onClose={readmeModal.closeReadme}
			/>
		</motion.div>
	);
};
