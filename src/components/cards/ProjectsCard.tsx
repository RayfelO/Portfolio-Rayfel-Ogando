import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Globe,
	Image as ImageIcon,
	Play,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { type Project, privateProjects, projects } from "../../data/portfolio";
import type { Translations } from "../../i18n/translations";
import { track } from "../../lib/analytics";
import { GithubIcon } from "../icons/GithubIcon";
import { cardVariants } from "../layout/BentoGrid";

interface ProjectsCardProps {
	id?: string;
	t: Translations;
	lang: "en" | "es";
}

type TabType = "open-source" | "private";

// --- LIGHTWEIGHT MARKDOWN TO HTML RENDERER ---
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
	const parseMarkdown = (md: string) => {
		let html = md;
		// Escape simple HTML characters to prevent XSS
		html = html
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		// Convert headers
		html = html.replace(
			/^#\s+(.+)$/gm,
			'<h1 class="text-2xl font-bold text-primary mt-6 mb-3 pb-2 border-b border-[var(--border-default)]">$1</h1>',
		);
		html = html.replace(
			/^##\s+(.+)$/gm,
			'<h2 class="text-xl font-bold text-primary mt-5 mb-2.5">$1</h2>',
		);
		html = html.replace(
			/^###\s+(.+)$/gm,
			'<h3 class="text-lg font-semibold text-primary mt-4 mb-2">$1</h3>',
		);

		// Convert code blocks
		html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
			return `<pre class="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-4 my-4 overflow-x-auto font-mono text-[13px] text-[var(--accent-text)]"><code class="language-${lang}">${code.trim()}</code></pre>`;
		});

		// Convert inline code
		html = html.replace(
			/`([^`]+)`/g,
			'<code class="bg-[var(--bg-subtle)] border border-[var(--border-default)] px-1.5 py-0.5 rounded font-mono text-[12.5px] text-[var(--accent-text)]">$1</code>',
		);

		// Convert bold text
		html = html.replace(
			/\*\*([^*]+)\*\*/g,
			'<strong class="font-bold text-primary">$1</strong>',
		);

		// Convert lists
		html = html.replace(
			/^\s*[-*]\s+(.+)$/gm,
			'<li class="ml-4 list-disc text-secondary my-1 leading-relaxed">$1</li>',
		);

		// Convert paragraphs (double newline splits)
		const blocks = html.split("\n\n");
		// fallow-ignore-next-line complexity
		const parsedBlocks = blocks.map((block) => {
			const trimmed = block.trim();
			if (
				trimmed.startsWith("<h") ||
				trimmed.startsWith("<li") ||
				trimmed.startsWith("<pre") ||
				trimmed.startsWith("<ul")
			) {
				return block;
			}
			if (trimmed === "") return "";
			return `<p class="text-[14.5px] text-secondary leading-relaxed my-3">${block}</p>`;
		});
		html = parsedBlocks.join("\n");

		return html;
	};

	const rawHtml = parseMarkdown(content);
	return (
		<div
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted markdown content parsed to HTML
			dangerouslySetInnerHTML={{ __html: rawHtml }}
			className="markdown-body text-left"
		/>
	);
};

// --- IMAGE CAROUSEL COMPONENT ---
interface ImageCarouselProps {
	images: string[];
	projectName: string;
	onImageClick: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
	images,
	projectName,
	onImageClick,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handlePrev = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	if (!images || images.length === 0) return null;

	return (
		<div className="relative w-full h-full group/carousel">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: Click triggers fullscreen zoom modal */}
			<img
				src={images[currentIndex]}
				alt={`${projectName} mockup screen ${currentIndex + 1}`}
				className="w-full h-full object-cover select-none transition-transform duration-350 cursor-zoom-in"
				loading="lazy"
				onClick={() => onImageClick(currentIndex)}
			/>
			<div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

			{images.length > 1 && (
				<>
					<button
						type="button"
						onClick={handlePrev}
						className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:bg-black/85 flex items-center justify-center text-white transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer select-none z-10"
					>
						<ChevronLeft size={16} />
					</button>
					<button
						type="button"
						onClick={handleNext}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:bg-black/85 flex items-center justify-center text-white transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer select-none z-10"
					>
						<ChevronRight size={16} />
					</button>

					<div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 select-none">
						{images.map((_, idx) => (
							<span
								key={images[idx]}
								className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
									idx === currentIndex ? "bg-white scale-125" : "bg-white/40"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
};

// --- LINK CARD COMPONENT (Bento Box Sub-element) ---
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

	const baseClass = `flex flex-col justify-between p-4 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 hover:-translate-y-0.5 text-left h-[105px] cursor-pointer group ${className}`;

	if (href) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={baseClass}
			>
				{content}
			</a>
		);
	}

	return (
		<button type="button" onClick={onClick} className={baseClass}>
			{content}
		</button>
	);
};

// Helper to extract and format project date range cleanly
const getProjectDateText = (project: Project, lang: "en" | "es") => {
	const start = lang === "es" ? project.startDateEs : project.startDateEn;
	const end = lang === "es" ? project.endDateEs : project.endDateEn;
	return end ? `${start} - ${end}` : start;
};

// --- PROJECT SELECTOR COMPONENT ---
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
	return (
		<>
			{/* Mobile chips list (Horizontal Scrollable) */}
			<div className="flex md:hidden overflow-x-auto gap-2 pb-2.5 scrollbar-none select-none w-full">
				{activeProjects.map((p) => {
					const active = p.id === activeProjectId;
					return (
						<button
							key={p.id}
							type="button"
							onClick={() => onSelect(p.id, p.name)}
							className={`flex-shrink-0 px-3.5 py-2 rounded-xl border flex flex-col gap-0.5 cursor-pointer transition-colors text-left ${
								active
									? "bg-[var(--bg-subtle)] border-[var(--border-hover)] text-primary font-medium"
									: "bg-transparent border-[var(--border-default)] text-secondary hover:text-primary"
							}`}
						>
							<div className="flex items-center gap-1.5 text-[12.5px] font-semibold">
								<span
									className={`w-1.5 h-1.5 rounded-full transition-all ${
										active
											? "bg-[var(--accent-light)] scale-110"
											: "border border-[var(--border-default)]"
									}`}
								/>
								{p.name}
							</div>
							<div className="pl-3 text-[9.5px] font-mono text-muted">
								{getProjectDateText(p, lang)}
							</div>
						</button>
					);
				})}
			</div>

			{/* Desktop list selector */}
			<div className="hidden md:flex flex-col gap-1.5 mt-1">
				{activeProjects.map((p) => {
					const active = p.id === activeProjectId;
					return (
						<button
							key={p.id}
							type="button"
							onClick={() => onSelect(p.id, p.name)}
							className={`w-full text-left px-3.5 py-2.5 rounded-lg flex flex-col gap-1 transition-all cursor-pointer border select-none ${
								active
									? "bg-[var(--bg-subtle)] border-[var(--border-default)] text-primary font-semibold shadow-xs"
									: "bg-transparent border-transparent text-secondary hover:text-primary hover:bg-[var(--bg-subtle)]/40"
							}`}
						>
							<div className="flex items-center gap-2.5 min-w-0 w-full">
								<span
									className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
										active
											? "bg-[var(--accent-light)] scale-110 shadow-[0_0_8px_var(--accent-light)]"
											: "border border-[var(--border-default)]"
									}`}
								/>
								<span className="truncate text-[13.5px] font-bold">
									{p.name}
								</span>
							</div>
							<div className="pl-4.5 text-[10px] font-mono text-muted">
								{getProjectDateText(p, lang)}
							</div>
						</button>
					);
				})}
			</div>
		</>
	);
};

// --- PROJECT BENTO PREVIEW PANEL ---
interface ProjectBentoPreviewProps {
	project: Project;
	lang: "en" | "es";
	mediaTab: "mockups" | "video";
	setMediaTab: (tab: "mockups" | "video") => void;
	onOpenReadme: (project: Project) => void;
	onImageClick: (images: string[], index: number) => void;
}

// fallow-ignore-next-line complexity
const ProjectBentoPreview: React.FC<ProjectBentoPreviewProps> = ({
	project,
	lang,
	mediaTab,
	setMediaTab,
	onOpenReadme,
	onImageClick,
}) => {
	const showGithub = !!project.githubUrl;
	const showLive = !!project.liveUrl;
	const showReadme =
		!!project.readmeUrl ||
		!!project.readmeContentEs ||
		!!project.readmeContentEn;

	const totalCards =
		(showGithub ? 1 : 0) + (showLive ? 1 : 0) + (showReadme ? 1 : 0);

	// Compute link grid column configuration dynamically
	let colsClass = "grid-cols-1 sm:grid-cols-3";
	if (totalCards === 1) {
		colsClass = "grid-cols-1";
	} else if (totalCards === 2) {
		colsClass = "grid-cols-1 sm:grid-cols-2";
	} else if (totalCards === 3) {
		colsClass = "grid-cols-1 sm:grid-cols-3";
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
			{/* Bento A: Description & Languages */}
			<div className="sm:col-span-6 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-5 flex flex-col justify-between gap-4 text-left">
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

			{/* Bento C: Images Carousel / YouTube player container */}
			<div className="sm:col-span-6 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl overflow-hidden relative aspect-video md:aspect-[21/9] bg-black/10">
				{project.youtubeUrl && project.images.length > 0 && (
					<div className="absolute top-3 right-3 z-20 flex bg-black/60 backdrop-blur-xs border border-white/10 rounded-lg p-0.5 select-none">
						<button
							type="button"
							onClick={() => setMediaTab("mockups")}
							className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
								mediaTab === "mockups"
									? "bg-white text-black"
									: "text-white/70 hover:text-white"
							}`}
						>
							<ImageIcon size={12} />
							{lang === "es" ? "Imágenes" : "Mockups"}
						</button>
						<button
							type="button"
							onClick={() => setMediaTab("video")}
							className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
								mediaTab === "video"
									? "bg-white text-black"
									: "text-white/70 hover:text-white"
							}`}
						>
							<Play
								size={12}
								fill={mediaTab === "video" ? "black" : "currentColor"}
							/>
							{lang === "es" ? "Video Demo" : "Video Demo"}
						</button>
					</div>
				)}

				{mediaTab === "video" && project.youtubeUrl ? (
					<iframe
						src={project.youtubeUrl}
						title={`${project.name} video demo`}
						className="absolute inset-0 w-full h-full border-0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
					/>
				) : (
					<ImageCarousel
						images={project.images}
						projectName={project.name}
						onImageClick={(index) => onImageClick(project.images, index)}
					/>
				)}
			</div>

			{/* Bento D: Row of Interactive link cards */}
			{totalCards > 0 && (
				<div className={`sm:col-span-6 grid gap-3 ${colsClass}`}>
					{showGithub && project.githubUrl && (
						<LinkCard
							href={project.githubUrl}
							icon={<GithubIcon size={18} />}
							label="GitHub"
							title={lang === "es" ? "Código fuente" : "Source code"}
						/>
					)}
					{showLive && project.liveUrl && (
						<LinkCard
							href={project.liveUrl}
							icon={<Globe size={18} />}
							label={lang === "es" ? "Despliegue" : "Deployment"}
							title={lang === "es" ? "Demo en vivo" : "Live demo"}
						/>
					)}
					{showReadme && (
						<LinkCard
							onClick={() => onOpenReadme(project)}
							icon={<BookOpen size={18} />}
							label="Markdown"
							title={
								project.readmeUrl
									? lang === "es"
										? "Ver README"
										: "View README"
									: lang === "es"
										? "Ver Documentación"
										: "View Docs"
							}
						/>
					)}
				</div>
			)}
		</div>
	);
};

// --- MAIN PROJECT CARD EXPORT ---
// fallow-ignore-next-line complexity
export const ProjectsCard: React.FC<ProjectsCardProps> = ({ id, t, lang }) => {
	const [activeTab, setActiveTab] = useState<TabType>("open-source");
	const activeProjects =
		activeTab === "open-source" ? projects : privateProjects;

	const [activeProjectId, setActiveProjectId] = useState<string>(
		activeProjects[0].id,
	);
	const [mediaTab, setMediaTab] = useState<"mockups" | "video">("mockups");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [readmeText, setReadmeText] = useState<string>("");
	const [loadingReadme, setLoadingReadme] = useState<boolean>(false);
	const [lightboxImages, setLightboxImages] = useState<string[]>([]);
	const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

	// Keyboard handlers for lightbox
	useEffect(() => {
		if (lightboxIndex === -1) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setLightboxIndex(-1);
			else if (e.key === "ArrowRight") {
				setLightboxIndex((prev) =>
					prev === lightboxImages.length - 1 ? 0 : prev + 1,
				);
			} else if (e.key === "ArrowLeft") {
				setLightboxIndex((prev) =>
					prev === 0 ? lightboxImages.length - 1 : prev - 1,
				);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [lightboxIndex, lightboxImages]);

	// Sync active ID when category changes
	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		const list = tab === "open-source" ? projects : privateProjects;
		setActiveProjectId(list[0].id);
		track.contactClicked(`tab_${tab}`);
	};

	const currentActiveProject =
		activeProjects.find((p) => p.id === activeProjectId) || activeProjects[0];

	// Reset media tab state when switching projects
	useEffect(() => {
		if (currentActiveProject) {
			setMediaTab(
				currentActiveProject.images.length === 0 &&
					currentActiveProject.youtubeUrl
					? "video"
					: "mockups",
			);
		}
	}, [currentActiveProject]);

	const handleOpenReadme = (project: Project) => {
		setSelectedProject(project);
		setLoadingReadme(true);
		track.projectClicked(project.name);

		if (project.readmeUrl) {
			fetch(project.readmeUrl)
				.then((res) => {
					if (!res.ok) throw new Error("Fail to load README");
					return res.text();
				})
				.then((text) => {
					setReadmeText(text);
					setLoadingReadme(false);
				})
				.catch(() => {
					setReadmeText(
						`# ${project.name}\n\n${
							lang === "es" ? project.descriptionEs : project.descriptionEn
						}\n\n*No se pudo descargar el archivo README desde GitHub en este momento.*`,
					);
					setLoadingReadme(false);
				});
		} else {
			const content =
				lang === "es" ? project.readmeContentEs : project.readmeContentEn;
			setReadmeText(content || "");
			setLoadingReadme(false);
		}
	};

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			className="bento-card col-span-4 flex flex-col gap-5 overflow-hidden"
			style={{ minHeight: "550px" }}
		>
			{/* Top Header Selector */}
			<div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-default)] select-none">
				<h2 className="text-[15.5px] font-bold uppercase tracking-wider text-primary">
					{t.sections.projects}
				</h2>
				<span className="font-mono text-[14.5px] text-secondary">
					{activeProjects.length} {lang === "es" ? "proyectos" : "projects"}
				</span>
			</div>

			{/* Split Navigation layout */}
			<div className="flex-1 flex flex-col md:flex-row gap-6">
				{/* Sidebar list selection */}
				<div className="w-full md:w-[240px] flex-shrink-0 flex flex-col gap-4">
					<div className="flex bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-0.5 w-full select-none">
						<button
							type="button"
							onClick={() => handleTabChange("open-source")}
							className={`flex-1 py-1.5 rounded-md text-[12.5px] font-bold cursor-pointer transition-colors ${
								activeTab === "open-source"
									? "bg-[var(--accent)] text-[var(--accent-text)]"
									: "text-secondary hover:text-primary"
							}`}
						>
							{t.projects.openSourceTab}
						</button>
						<button
							type="button"
							onClick={() => handleTabChange("private")}
							className={`flex-1 py-1.5 rounded-md text-[12.5px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
								activeTab === "private"
									? "bg-[var(--accent)] text-[var(--accent-text)]"
									: "text-secondary hover:text-primary"
							}`}
						>
							{t.projects.privateTab}
						</button>
					</div>

					<ProjectSelector
						activeProjects={activeProjects}
						activeProjectId={activeProjectId}
						lang={lang}
						onSelect={(id, name) => {
							setActiveProjectId(id);
							track.projectClicked(name);
						}}
					/>
				</div>

				<div className="hidden md:block w-[0.5px] bg-[var(--border-default)] self-stretch" />

				{/* Bento preview box details */}
				<div className="flex-1 flex flex-col gap-3 min-h-[450px]">
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
								mediaTab={mediaTab}
								setMediaTab={setMediaTab}
								onOpenReadme={handleOpenReadme}
								onImageClick={(images, index) => {
									setLightboxImages(images);
									setLightboxIndex(index);
								}}
							/>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			{/* Full Screen README Modal Overlay */}
			<AnimatePresence>
				{selectedProject && (
					<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-8">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="bg-[var(--bg-card)] border border-[var(--border-hover)] rounded-xl w-full max-w-[800px] h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
						>
							<div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border-default)] select-none">
								<div className="flex items-center gap-2">
									<BookOpen size={18} className="text-secondary" />
									<span className="font-mono text-[14.5px] font-bold text-primary">
										{selectedProject.name} —{" "}
										{selectedProject.readmeUrl ? "README.md" : "DOCUMENTACIÓN"}
									</span>
								</div>
								<button
									type="button"
									onClick={() => setSelectedProject(null)}
									className="text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
								>
									<X size={18} />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
								{loadingReadme ? (
									<div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
										<div className="w-8 h-8 rounded-full border-[3px] border-[var(--border-default)] border-t-[var(--accent-light)] animate-spin" />
										<span className="font-mono text-[13px] text-secondary">
											{lang === "es"
												? "Cargando archivo..."
												: "Loading document..."}
										</span>
									</div>
								) : (
									<MarkdownRenderer content={readmeText} />
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Image Lightbox Modal Overlay */}
			<AnimatePresence>
				{lightboxIndex !== -1 && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handles keyboard dismissal
					// biome-ignore lint/a11y/noStaticElementInteractions: Click on backdrop dismisses modal
					<div
						className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-zoom-out select-none"
						onClick={() => setLightboxIndex(-1)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="relative max-w-full max-h-full flex items-center justify-center"
							onClick={(e) => e.stopPropagation()}
						>
							<img
								src={lightboxImages[lightboxIndex]}
								alt="Project mockup full size"
								className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl"
							/>
							<button
								type="button"
								onClick={() => setLightboxIndex(-1)}
								className="absolute -top-12 right-0 text-white/85 hover:text-white p-2 rounded-lg bg-black/40 hover:bg-black/65 transition-colors cursor-pointer"
							>
								<X size={20} />
							</button>

							{lightboxImages.length > 1 && (
								<>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setLightboxIndex((prev) =>
												prev === 0 ? lightboxImages.length - 1 : prev - 1,
											);
										}}
										className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 border border-white/10 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer select-none transition-colors"
									>
										<ChevronLeft size={20} />
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setLightboxIndex((prev) =>
												prev === lightboxImages.length - 1 ? 0 : prev + 1,
											);
										}}
										className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 border border-white/10 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer select-none transition-colors"
									>
										<ChevronRight size={20} />
									</button>
								</>
							)}
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
