import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import { BookOpen, Globe, Image as ImageIcon, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { type Project, privateProjects, projects } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { GithubIcon } from "../icons/GithubIcon";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";
import { OptimizedYouTubePlayer } from "../OptimizedYouTubePlayer";

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

interface ResolvedReadme {
	rawUrl: string;
	rawBaseUrl: string;
	blobBaseUrl: string;
	source: "remote" | "embedded";
}

const readmeSanitizeSchema = {
	...defaultSchema,
	tagNames: [...(defaultSchema.tagNames ?? []), "div", "span", "br", "img"],
	attributes: {
		...defaultSchema.attributes,
		a: [...(defaultSchema.attributes?.a ?? []), "href", "title"],
		div: [...(defaultSchema.attributes?.div ?? []), "align"],
		h1: [...(defaultSchema.attributes?.h1 ?? []), "align"],
		h2: [...(defaultSchema.attributes?.h2 ?? []), "align"],
		h3: [...(defaultSchema.attributes?.h3 ?? []), "align"],
		h4: [...(defaultSchema.attributes?.h4 ?? []), "align"],
		h5: [...(defaultSchema.attributes?.h5 ?? []), "align"],
		h6: [...(defaultSchema.attributes?.h6 ?? []), "align"],
		img: [
			...(defaultSchema.attributes?.img ?? []),
			"src",
			"alt",
			"title",
			"width",
			"height",
			"align",
		],
		p: [...(defaultSchema.attributes?.p ?? []), "align"],
		span: [...(defaultSchema.attributes?.span ?? []), "align"],
	},
};

const getAlignmentClassName = (align?: string) => {
	switch (align?.toLowerCase()) {
		case "center":
			return "text-center";
		case "right":
			return "text-right";
		case "left":
			return "text-left";
		default:
			return "";
	}
};

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

const isAbsoluteUrl = (url: string) => /^[a-z][a-z\d+\-.]*:/i.test(url);

const isHashLink = (url: string) => url.startsWith("#");

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

const buildReadmeCandidates = (project: Project): ResolvedReadme[] => {
	const repoInfo = project.githubUrl
		? parseGithubRepo(project.githubUrl)
		: null;
	const candidates: ResolvedReadme[] = [];

	if (project.readmeUrl) {
		try {
			const rawUrl = new URL(project.readmeUrl);
			const parts = rawUrl.pathname.split("/").filter(Boolean);
			if (
				rawUrl.hostname === "raw.githubusercontent.com" &&
				parts.length >= 4
			) {
				const [owner, repo, branch, ...pathParts] = parts;
				const directory = getDirectoryPath(pathParts.join("/"));
				candidates.push({
					rawUrl: project.readmeUrl,
					rawBaseUrl: normalizeBaseUrl(
						`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${directory}`,
					),
					blobBaseUrl: normalizeBaseUrl(
						`https://github.com/${owner}/${repo}/blob/${branch}/${directory}`,
					),
					source: "remote",
				});
			}
		} catch {}
	}

	if (!repoInfo) {
		return candidates;
	}

	for (const branch of ["main", "master"]) {
		for (const fileName of ["README.md", "README.MD"]) {
			const rawUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/${branch}/${fileName}`;
			if (candidates.some((candidate) => candidate.rawUrl === rawUrl)) {
				continue;
			}

			candidates.push({
				rawUrl,
				rawBaseUrl: normalizeBaseUrl(
					`https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/${branch}/`,
				),
				blobBaseUrl: normalizeBaseUrl(
					`https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/${branch}/`,
				),
				source: "remote",
			});
		}
	}

	return candidates;
};

const validateRemoteReadme = async (rawUrl: string, signal?: AbortSignal) => {
	try {
		const headResponse = await fetch(rawUrl, {
			method: "HEAD",
			signal,
		});

		if (headResponse.ok) {
			return true;
		}

		if (headResponse.status !== 405) {
			return false;
		}
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
	}

	try {
		const getResponse = await fetch(rawUrl, { signal });
		return getResponse.ok;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		return false;
	}
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

const resolveMarkdownUrl = (
	url: string,
	readme: ResolvedReadme | null,
	target: "image" | "link",
) => {
	if (!readme || isAbsoluteUrl(url) || isHashLink(url)) {
		return url;
	}

	const baseUrl = target === "image" ? readme.rawBaseUrl : readme.blobBaseUrl;
	return new URL(url, baseUrl).toString();
};

const MarkdownRenderer: React.FC<{
	content: string;
	readme: ResolvedReadme | null;
}> = ({ content, readme }) => {
	const isRemoteReadme = readme?.source === "remote";

	return (
		<div className="markdown-body text-left">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={
					isRemoteReadme
						? [rehypeRaw, [rehypeSanitize, readmeSanitizeSchema]]
						: []
				}
				components={{
					h1: ({ children, node }) => (
						<h1
							className={`text-2xl font-bold text-primary mt-6 mb-3 pb-2 border-b border-[var(--border-default)] ${getAlignmentClassName(
								typeof node?.properties?.align === "string"
									? node.properties.align
									: undefined,
							)}`}
						>
							{children}
						</h1>
					),
					h2: ({ children, node }) => (
						<h2
							className={`text-xl font-bold text-primary mt-5 mb-2.5 ${getAlignmentClassName(
								typeof node?.properties?.align === "string"
									? node.properties.align
									: undefined,
							)}`}
						>
							{children}
						</h2>
					),
					h3: ({ children, node }) => (
						<h3
							className={`text-lg font-semibold text-primary mt-4 mb-2 ${getAlignmentClassName(
								typeof node?.properties?.align === "string"
									? node.properties.align
									: undefined,
							)}`}
						>
							{children}
						</h3>
					),
					p: ({ children, node }) => (
						<p
							className={`text-[14.5px] text-secondary leading-relaxed my-3 ${getAlignmentClassName(
								typeof node?.properties?.align === "string"
									? node.properties.align
									: undefined,
							)}`}
						>
							{children}
						</p>
					),
					div: ({ children, node }) => (
						<div
							className={`text-[14.5px] text-secondary leading-relaxed my-3 ${getAlignmentClassName(
								typeof node?.properties?.align === "string"
									? node.properties.align
									: undefined,
							)}`}
						>
							{children}
						</div>
					),
					span: ({ children }) => <span>{children}</span>,
					br: () => <br />,
					strong: ({ children }) => (
						<strong className="font-bold text-primary">{children}</strong>
					),
					ul: ({ children }) => (
						<ul className="my-3 space-y-1 pl-5 list-disc text-secondary">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="my-3 space-y-1 pl-5 list-decimal text-secondary">
							{children}
						</ol>
					),
					li: ({ children }) => (
						<li className="text-secondary leading-relaxed">{children}</li>
					),
					code: ({ children, className }) =>
						className ? (
							<code className={className}>{children}</code>
						) : (
							<code className="bg-[var(--bg-subtle)] border border-[var(--border-default)] px-1.5 py-0.5 rounded font-mono text-[12.5px] text-[var(--accent-text)]">
								{children}
							</code>
						),
					pre: ({ children }) => (
						<pre className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-4 my-4 overflow-x-auto font-mono text-[13px] text-[var(--accent-text)]">
							{children}
						</pre>
					),
					table: ({ children }) => (
						<div className="my-4 overflow-x-auto">
							<table className="min-w-full border-collapse text-[14px] text-secondary">
								{children}
							</table>
						</div>
					),
					th: ({ children }) => (
						<th className="border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-left font-semibold text-primary">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="border border-[var(--border-default)] px-3 py-2 align-top">
							{children}
						</td>
					),
					a: ({ children, href }) => (
						<a
							href={href ? resolveMarkdownUrl(href, readme, "link") : undefined}
							target={href && !isHashLink(href) ? "_blank" : undefined}
							rel={
								href && !isHashLink(href) ? "noopener noreferrer" : undefined
							}
							className="text-[var(--accent-light)] underline underline-offset-2 transition-colors hover:text-primary"
						>
							{children}
						</a>
					),
					img: ({ src, alt, width, height, title }) => (
						<img
							src={src ? resolveMarkdownUrl(src, readme, "image") : undefined}
							alt={alt ?? ""}
							width={width}
							height={height}
							title={title}
							loading="lazy"
							className="inline-block h-auto max-w-full align-middle"
						/>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
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

const getTileClassName = (
	projectId: string,
	layout: MediaLayout,
	item: MediaItem,
	index: number,
	imageCount: number,
) => {
	if (projectId === "emmax") {
		return "aspect-[24/7] min-h-[140px] sm:min-h-[160px]";
	}

	if (projectId === "avaluo" && layout === "video-hero") {
		if (index === 0 && item.kind === "video") {
			return "sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
		}

		if (index === 1 && item.kind === "image") {
			return "sm:col-span-1 lg:col-span-2 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
		}

		return "sm:col-span-1 lg:col-span-2 lg:row-span-1 min-h-[140px] sm:min-h-[164px]";
	}

	if (layout === "single-focus") {
		return "sm:col-span-3 lg:col-span-6 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
	}

	if (layout === "video-hero" && index === 0 && item.kind === "video") {
		return "sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
	}

	if (layout === "image-hero" && index === 0 && item.kind === "image") {
		return "sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
	}

	if (imageCount === 1 && index === 1) {
		return "sm:col-span-1 lg:col-span-2 lg:row-span-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]";
	}

	return "sm:col-span-1 lg:col-span-2 lg:row-span-1 min-h-[140px] sm:min-h-[164px]";
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
}> = ({ projectName, youtubeUrl, onOpen, className }) => {
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
}> = ({ projectName, image, className, onOpen }) => {
	return (
		<button
			type="button"
			onClick={onOpen}
			className={`${mediaTileBase} rounded-lg ${className} focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50`}
		>
			<div className="absolute inset-0 p-1.5">
				<div className="relative h-full w-full overflow-hidden rounded-md border border-white/5 bg-[var(--bg-card)]/80">
					<img
						src={image.src}
						alt={`${projectName} preview`}
						className="absolute inset-0 h-full w-full select-none object-cover object-left-top"
						loading="lazy"
					/>
					<div className={mediaTileOverlay} />
					<div className="absolute right-3 bottom-3 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 p-2 text-white/90">
						<ImageIcon size={14} />
					</div>
				</div>
			</div>
		</button>
	);
};

const MediaCollage: React.FC<{
	project: Project;
}> = ({ project }) => {
	const items = useMemo(() => buildMediaItems(project), [project]);
	const lightboxElements = useMemo(
		() => buildLightboxElements(project, items),
		[project, items],
	);
	const layout = getMediaLayout(items);
	const imageCount = items.filter((item) => item.kind === "image").length;
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
		<div className={getCollageGridClassName(project.id)}>
			{items.map((item, index) => {
				const className = getTileClassName(
					project.id,
					layout,
					item,
					index,
					imageCount,
				);

				if (item.kind === "video") {
					return (
						<VideoHeroTile
							key={`${project.id}-video`}
							projectName={project.name}
							youtubeUrl={item.videoUrl}
							onOpen={() => openLightboxAt(index)}
							className={className}
						/>
					);
				}

				return (
					<ImageTile
						key={item.slide.src}
						projectName={project.name}
						image={item.slide}
						className={className}
						onOpen={() => openLightboxAt(index)}
					/>
				);
			})}
		</div>
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

	if (!project) {
		return null;
	}

	return createPortal(
		<AnimatePresence>
			<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 15 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
					className="bg-[var(--bg-card)] border border-[var(--border-hover)] rounded-xl w-full max-w-[800px] max-h-[85dvh] h-[80dvh] flex flex-col overflow-hidden shadow-2xl relative"
				>
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

					<div
						data-lenis-prevent
						className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar"
					>
						{loading ? (
							<div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
								<div className="w-8 h-8 rounded-full border-[3px] border-[var(--border-default)] border-t-[var(--accent-light)] animate-spin" />
								<span className="font-mono text-[13px] text-secondary">
									{lang === "es"
										? "Cargando archivo..."
										: "Loading document..."}
								</span>
							</div>
						) : (
							<MarkdownRenderer
								content={readmeText}
								readme={readme?.source === "remote" ? readme : null}
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

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
	activeProjects,
	activeProjectId,
	onSelect,
	lang,
}) => {
	const renderProjectItem = (project: Project, isMobile: boolean) => {
		const active = project.id === activeProjectId;
		return (
			<button
				key={project.id}
				type="button"
				onClick={() => onSelect(project.id, project.name)}
				className={
					isMobile
						? `relative w-full px-3 py-2.5 rounded-xl border flex flex-col gap-0.5 cursor-pointer text-left overflow-hidden transition-all duration-150 ${
								active
									? "border-transparent text-primary font-medium"
									: "border-[var(--border-default)] text-secondary hover:text-primary hover:bg-[var(--bg-subtle)]/40 hover:border-[var(--border-hover)]"
							}`
						: `relative w-full text-left px-3.5 py-2.5 rounded-lg flex flex-col gap-1 cursor-pointer border select-none overflow-hidden transition-all duration-150 ${
								active
									? "border-transparent text-primary font-semibold shadow-xs"
									: "border-transparent text-secondary hover:text-primary hover:bg-[var(--bg-subtle)]/30 hover:border-[var(--border-default)]"
							}`
				}
			>
				{active && (
					<motion.div
						layoutId={
							isMobile
								? "activeProjectChipHighlight"
								: "activeProjectListHighlight"
						}
						className={
							isMobile
								? "absolute inset-0 bg-[var(--bg-card)] border border-[var(--projects-index-highlight-border)] rounded-xl -z-0"
								: "absolute inset-0 bg-[var(--bg-card)] border border-[var(--projects-index-highlight-border)] rounded-lg -z-0"
						}
						transition={{ type: "spring", stiffness: 350, damping: 30 }}
					/>
				)}
				<div
					className={
						isMobile
							? "relative z-10 flex items-center gap-1.5 text-[12.5px]"
							: "relative z-10 flex items-center gap-2.5 min-w-0 w-full"
					}
				>
					<span
						className={
							isMobile
								? `w-1.5 h-1.5 rounded-full border projects-index-dot ${
										active
											? "bg-[var(--accent-brand)] border-[var(--accent-brand)] scale-110"
											: "bg-transparent border-[var(--projects-index-dot-border)]"
									}`
								: `w-2 h-2 rounded-full flex-shrink-0 border projects-index-dot ${
										active
											? "bg-[var(--accent-brand)] border-[var(--accent-brand)] scale-110 shadow-[0_0_8px_rgba(43,69,136,0.55)]"
											: "bg-transparent border-[var(--projects-index-dot-border)]"
									}`
						}
					/>
					{isMobile ? (
						<span className="truncate block text-[12.5px] font-medium">
							{project.name}
						</span>
					) : (
						<span className="truncate text-[13.5px] font-bold">
							{project.name}
						</span>
					)}
				</div>
				<div
					className={
						isMobile
							? "relative z-10 text-[9.5px] font-mono text-muted mt-0.5"
							: "relative z-10 pl-4.5 text-[10px] font-mono text-muted"
					}
				>
					{getProjectDateText(project, lang)}
				</div>
			</button>
		);
	};

	return (
		<>
			<div className="grid grid-cols-2 md:hidden gap-2 pb-1 select-none w-full">
				{activeProjects.map((project) => renderProjectItem(project, true))}
			</div>
			<div className="hidden md:flex flex-col gap-1.5 mt-1 relative">
				{activeProjects.map((project) => renderProjectItem(project, false))}
			</div>
		</>
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

	const totalCards =
		(showGithub ? 1 : 0) + (showLive ? 1 : 0) + (showReadme ? 1 : 0);

	let colsClass = "grid-cols-1 sm:grid-cols-3";
	if (totalCards === 1) {
		colsClass = "grid-cols-1";
	} else if (totalCards === 2) {
		colsClass = "grid-cols-1 sm:grid-cols-2";
	}

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
						{lang === "es" ? project.descriptionEs : project.descriptionEn}
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
				<MediaCollage project={project} />
			</div>

			{totalCards > 0 && (
				<div className={`sm:col-span-6 grid gap-3 ${colsClass}`}>
					{showGithub && project.githubUrl && (
						<LinkCard
							href={project.githubUrl}
							icon={<GithubIcon size={18} />}
							label="GitHub"
							title={lang === "es" ? "Codigo fuente" : "Source code"}
						/>
					)}
					{showLive && project.liveUrl && (
						<LinkCard
							href={project.liveUrl}
							icon={<Globe size={18} />}
							label={lang === "es" ? "Despliegue" : "Deployment"}
							title={lang === "es" ? "Visitar sitio" : "Visit site"}
						/>
					)}
					{showReadme && (
						<LinkCard
							onClick={() => onOpenReadme(project)}
							icon={<BookOpen size={18} />}
							label="Markdown"
							title={readmeLabel}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export const ProjectsCard: React.FC<ProjectsCardProps> = ({
	id,
	t,
	lang,
	className,
}) => {
	const [activeTab, setActiveTab] = useState<TabType>("open-source");
	const activeProjects =
		activeTab === "open-source" ? projects : privateProjects;
	const [activeProjectId, setActiveProjectId] = useState<string>(
		activeProjects[0].id,
	);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [readmeText, setReadmeText] = useState<string>("");
	const [loadingReadme, setLoadingReadme] = useState<boolean>(false);
	const [selectedReadme, setSelectedReadme] = useState<ResolvedReadme | null>(
		null,
	);
	const [resolvedReadmes, setResolvedReadmes] = useState<
		Record<string, ResolvedReadme | null | undefined>
	>({});

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		const list = tab === "open-source" ? projects : privateProjects;
		setActiveProjectId(list[0].id);
		track.contactClicked(`tab_${tab}`);
	};

	const currentActiveProject =
		activeProjects.find((project) => project.id === activeProjectId) ||
		activeProjects[0];
	const currentResolvedReadme = resolvedReadmes[currentActiveProject.id];
	const currentProjectHasReadme =
		activeTab === "open-source"
			? currentResolvedReadme !== undefined && currentResolvedReadme !== null
			: !!(lang === "es"
					? currentActiveProject.readmeContentEs
					: currentActiveProject.readmeContentEn);
	const currentReadmeLabel =
		activeTab === "open-source"
			? lang === "es"
				? "Ver README"
				: "View README"
			: lang === "es"
				? "Ver Documentacion"
				: "View Docs";

	useEffect(() => {
		if (activeTab !== "open-source" || !currentActiveProject.githubUrl) {
			return;
		}

		if (resolvedReadmes[currentActiveProject.id] !== undefined) {
			return;
		}

		const controller = new AbortController();

		resolveRemoteReadme(currentActiveProject, controller.signal)
			.then((resolvedReadme) => {
				setResolvedReadmes((previous) => ({
					...previous,
					[currentActiveProject.id]: resolvedReadme,
				}));
			})
			.catch((error) => {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}

				setResolvedReadmes((previous) => ({
					...previous,
					[currentActiveProject.id]: null,
				}));
			});

		return () => controller.abort();
	}, [activeTab, currentActiveProject, resolvedReadmes]);

	const handleOpenReadme = (project: Project) => {
		setSelectedProject(project);
		setLoadingReadme(true);
		setSelectedReadme(null);
		track.projectClicked(project.name);

		if (activeTab === "open-source") {
			const resolvedReadme = resolvedReadmes[project.id];
			if (!resolvedReadme) {
				setReadmeText(
					lang === "es"
						? "# README no disponible\n\nNo se encontro un README remoto valido para este repositorio."
						: "# README unavailable\n\nNo valid remote README was found for this repository.",
				);
				setLoadingReadme(false);
				return;
			}

			fetch(resolvedReadme.rawUrl)
				.then((res) => {
					if (!res.ok) throw new Error("Fail to load README");
					return res.text();
				})
				.then((text) => {
					setReadmeText(text);
					setSelectedReadme(resolvedReadme);
					setLoadingReadme(false);
				})
				.catch(() => {
					setReadmeText(
						lang === "es"
							? `# ${project.name}\n\nNo se pudo descargar el archivo README desde GitHub en este momento.`
							: `# ${project.name}\n\nThe README could not be downloaded from GitHub right now.`,
					);
					setLoadingReadme(false);
				});
			return;
		}

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

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...(selectedProject ? {} : cardHoverProps)}
			className={`bento-card bento-card--brand-blue bento-col-4 flex flex-col gap-5 overflow-visible ${className || ""}`}
		>
			<div className="flex justify-between items-center pb-2.5 border-b border-[var(--projects-card-border)] select-none">
				<h2 className="text-[15.5px] font-bold uppercase tracking-wider text-primary">
					{t.sections.projects}
				</h2>
				<span className="font-mono text-[14.5px] text-secondary">
					{activeProjects.length} {lang === "es" ? "proyectos" : "projects"}
				</span>
			</div>

			<div className="flex-1 flex flex-col md:flex-row gap-6">
				<div className="w-full md:w-[220px] lg:w-[240px] flex-shrink-0 flex flex-col gap-4">
					<div className="flex bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-0.5 w-full select-none relative">
						<button
							type="button"
							onClick={() => handleTabChange("open-source")}
							className="relative flex-1 py-1.5 text-[12.5px] font-bold cursor-pointer text-center flex items-center justify-center"
						>
							{activeTab === "open-source" && (
								<motion.div
									layoutId="activeProjectCategoryBackground"
									className="absolute inset-0 bg-[var(--accent)] rounded-md z-0"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
							<span
								className={`relative z-10 transition-colors ${activeTab === "open-source" ? "text-[var(--accent-text)]" : "text-secondary hover:text-primary"}`}
							>
								{t.projects.openSourceTab}
							</span>
						</button>
						<button
							type="button"
							onClick={() => handleTabChange("private")}
							className="relative flex-1 py-1.5 text-[12.5px] font-bold cursor-pointer text-center flex items-center justify-center gap-1"
						>
							{activeTab === "private" && (
								<motion.div
									layoutId="activeProjectCategoryBackground"
									className="absolute inset-0 bg-[var(--accent)] rounded-md z-0"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
							<span
								className={`relative z-10 transition-colors flex items-center justify-center gap-1 ${activeTab === "private" ? "text-[var(--accent-text)]" : "text-secondary hover:text-primary"}`}
							>
								{t.projects.privateTab}
							</span>
						</button>
					</div>

					<ProjectSelector
						activeProjects={activeProjects}
						activeProjectId={activeProjectId}
						lang={lang}
						onSelect={(projectId, name) => {
							setActiveProjectId(projectId);
							track.projectClicked(name);
						}}
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
								onOpenReadme={handleOpenReadme}
								showReadme={currentProjectHasReadme}
								readmeLabel={currentReadmeLabel}
							/>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			<ReadmeModal
				project={selectedProject}
				readme={selectedReadme}
				readmeText={readmeText}
				loading={loadingReadme}
				lang={lang}
				onClose={() => setSelectedProject(null)}
			/>
		</motion.div>
	);
};
