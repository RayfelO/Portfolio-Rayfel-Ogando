import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Globe,
	Lock,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
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
const ImageCarousel: React.FC<{ images: string[]; projectName: string }> = ({
	images,
	projectName,
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
		<div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-black/20 group/carousel">
			{/* Slides */}
			<img
				src={images[currentIndex]}
				alt={`${projectName} mockup screen ${currentIndex + 1}`}
				className="w-full h-full object-cover select-none transition-transform duration-350"
				loading="lazy"
			/>

			{/* Black Overlay vignette at the bottom */}
			<div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

			{/* Carousel Control Arrows */}
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

			{/* Indicators Dot Indicator */}
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
		</div>
	);
};

export const ProjectsCard: React.FC<ProjectsCardProps> = ({ id, t, lang }) => {
	const [activeTab, setActiveTab] = useState<TabType>("open-source");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [readmeText, setReadmeText] = useState<string>("");
	const [loadingReadme, setLoadingReadme] = useState<boolean>(false);

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		track.contactClicked(`tab_${tab}`);
	};

	const handleOpenReadme = (project: Project) => {
		setSelectedProject(project);
		setLoadingReadme(true);
		track.projectClicked(project.name);

		if (project.readmeUrl) {
			// Fetch real README from GitHub
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
					// Fallback description in case fetch fails
					setReadmeText(
						`# ${project.name}\n\n${
							lang === "es" ? project.descriptionEs : project.descriptionEn
						}\n\n*No se pudo descargar el archivo README desde GitHub en este momento.*`,
					);
					setLoadingReadme(false);
				});
		} else {
			// Load static local documentation
			const content =
				lang === "es" ? project.readmeContentEs : project.readmeContentEn;
			setReadmeText(content || "");
			setLoadingReadme(false);
		}
	};

	const activeProjects =
		activeTab === "open-source" ? projects : privateProjects;

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			className="bento-card col-span-4 flex flex-col gap-5 overflow-hidden"
			style={{ minHeight: "550px" }}
		>
			{/* Top Menu: Tabs & Counter */}
			<div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-default)] select-none">
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => handleTabChange("open-source")}
						className={`relative text-[15.5px] font-bold uppercase tracking-wider cursor-pointer transition-colors pb-1.5 ${
							activeTab === "open-source"
								? "text-primary"
								: "text-secondary hover:text-primary"
						}`}
					>
						{t.projects.openSourceTab}
						{activeTab === "open-source" && (
							<motion.div
								layoutId="active-project-tab"
								className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--accent-light)]"
							/>
						)}
					</button>
					<button
						type="button"
						onClick={() => handleTabChange("private")}
						className={`relative text-[15.5px] font-bold uppercase tracking-wider cursor-pointer transition-colors pb-1.5 flex items-center gap-1.5 ${
							activeTab === "private"
								? "text-primary"
								: "text-secondary hover:text-primary"
						}`}
					>
						<Lock size={13} className="stroke-[2.5]" />
						{t.projects.privateTab}
						{activeTab === "private" && (
							<motion.div
								layoutId="active-project-tab"
								className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--accent-light)]"
							/>
						)}
					</button>
				</div>

				<span className="font-mono text-[14.5px] text-secondary">
					{activeProjects.length} {lang === "es" ? "proyectos" : "projects"}
				</span>
			</div>

			{/* Responsive Grid of Project Cards */}
			<div className="flex-1 min-h-[400px]">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						transition={{ duration: 0.25 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{activeProjects.map((project) => {
							const description =
								lang === "es" ? project.descriptionEs : project.descriptionEn;
							const viewReadmeText =
								lang === "es" ? "Ver README" : "View README";
							const viewDocText =
								lang === "es" ? "Documentación" : "Documentation";

							return (
								<div
									key={project.id}
									className="flex flex-col rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] overflow-hidden hover:border-[var(--border-hover)] transition-colors duration-200"
								>
									{/* Top Gallery Carousel */}
									<ImageCarousel
										images={project.images}
										projectName={project.name}
									/>

									{/* Card Content details */}
									<div className="flex-1 p-5 flex flex-col justify-between gap-4">
										<div className="flex flex-col gap-2">
											<div className="flex items-center justify-between gap-2">
												<h3 className="text-[17px] font-bold text-primary tracking-tight">
													{project.name}
												</h3>
												{/* Tech Stack Badges */}
												<div className="flex flex-wrap gap-1">
													{project.languages.map((langItem) => (
														<span
															key={langItem}
															className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-secondary select-none"
														>
															{langItem}
														</span>
													))}
												</div>
											</div>
											<p className="text-[14.5px] text-secondary leading-relaxed text-left line-clamp-3">
												{description}
											</p>
										</div>

										{/* Interactive Footer Controls */}
										<div className="flex items-center justify-between gap-2 mt-2 select-none">
											<div className="flex items-center gap-2">
												{/* Repository URL */}
												{project.githubUrl && (
													<a
														href={project.githubUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="w-9 h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] text-secondary hover:text-primary flex items-center justify-center transition-colors"
														aria-label="GitHub Repository"
													>
														<GithubIcon size={16} />
													</a>
												)}

												{/* Live Demo Site URL */}
												{project.liveUrl && (
													<a
														href={project.liveUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="w-9 h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] text-secondary hover:text-primary flex items-center justify-center transition-colors"
														aria-label="Live Demo"
													>
														<Globe size={16} />
													</a>
												)}
											</div>

											{/* README Modal Launcher */}
											<button
												type="button"
												onClick={() => handleOpenReadme(project)}
												className="font-mono text-[13px] font-semibold text-secondary hover:text-primary flex items-center gap-1.5 border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] rounded-lg px-3 py-2 cursor-pointer transition-colors"
											>
												<BookOpen size={14} />
												{project.readmeUrl ? viewReadmeText : viewDocText}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* README VISUALIZER MODAL OVERLAY */}
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
							{/* Modal Header */}
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

							{/* Modal Body */}
							<div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
								{loadingReadme ? (
									<div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
										{/* Loading Spinner */}
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
		</motion.div>
	);
};
