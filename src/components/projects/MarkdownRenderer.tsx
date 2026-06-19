import type React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { LoadingMedia } from "../media/LoadingMedia";

interface MarkdownNode {
	tagName?: string;
	properties?: Record<string, unknown>;
}

export interface ResolvedReadme {
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

const isAbsoluteUrl = (url: string) => /^[a-z][a-z\d+\-.]*:/i.test(url);
const isHashLink = (url: string) => url.startsWith("#");
const isExternalMarkdownUrl = (url: string) =>
	isAbsoluteUrl(url) || isHashLink(url);

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

const resolveMarkdownUrl = (
	url: string,
	readme: ResolvedReadme | null,
	target: "image" | "link",
) => {
	if (!readme || isExternalMarkdownUrl(url)) return url;
	const baseUrl = target === "image" ? readme.rawBaseUrl : readme.blobBaseUrl;
	return new URL(url, baseUrl).toString();
};

const getMarkdownLinkProps = (
	href: string | undefined,
	readme: ResolvedReadme | null,
) => {
	if (!href) return { href: undefined, target: undefined, rel: undefined };
	const isExternal = isExternalMarkdownUrl(href);
	return {
		href: resolveMarkdownUrl(href, readme, "link"),
		target: isExternal ? "_blank" : undefined,
		rel: isExternal ? "noopener noreferrer" : undefined,
	};
};

const H1_CLASS =
	"text-2xl font-bold text-primary mt-6 mb-3 pb-2 border-b border-[var(--border-default)]";
const H2_CLASS = "text-xl font-bold text-primary mt-5 mb-2.5";
const H3_CLASS = "text-lg font-semibold text-primary mt-4 mb-2";
const PARAGRAPH_CLASS = "text-[14.5px] text-secondary leading-relaxed my-3";
const LIST_CLASS = "my-3 space-y-1 pl-5 list-disc text-secondary";
const ORDERED_LIST_CLASS = "my-3 space-y-1 pl-5 list-decimal text-secondary";
const INLINE_CODE_CLASS =
	"bg-[var(--bg-subtle)] border border-[var(--border-default)] px-1.5 py-0.5 rounded font-mono text-[12.5px] text-[var(--accent-text)]";
const PRE_CLASS =
	"bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-4 my-4 overflow-x-auto font-mono text-[13px] text-[var(--accent-text)]";
const LINK_CLASS =
	"text-[var(--accent-light)] underline underline-offset-2 transition-colors hover:text-primary";

const headingClassMap: Record<string, string> = {
	h1: H1_CLASS,
	h2: H2_CLASS,
	h3: H3_CLASS,
};

const getAlignProp = (node?: MarkdownNode): string | undefined =>
	typeof node?.properties?.align === "string"
		? node.properties.align
		: undefined;

const MarkdownHeading: React.FC<{
	children?: React.ReactNode;
	node?: MarkdownNode;
}> = ({ children, node }) => {
	const tagName = (node?.tagName as string) ?? "h1";
	const Tag = tagName as "h1" | "h2" | "h3";
	return (
		<Tag
			className={`${headingClassMap[tagName] ?? ""} ${getAlignmentClassName(getAlignProp(node))}`}
		>
			{children}
		</Tag>
	);
};

const MarkdownParagraph: React.FC<{
	children?: React.ReactNode;
	node?: MarkdownNode;
}> = ({ children, node }) => {
	const align =
		typeof node?.properties?.align === "string"
			? node.properties.align
			: undefined;
	return (
		<div className={`${PARAGRAPH_CLASS} ${getAlignmentClassName(align)}`}>
			{children}
		</div>
	);
};

const MarkdownList: React.FC<{
	children?: React.ReactNode;
	ordered?: boolean;
}> = ({ children, ordered }) =>
	ordered ? (
		<ol className={ORDERED_LIST_CLASS}>{children}</ol>
	) : (
		<ul className={LIST_CLASS}>{children}</ul>
	);

const MarkdownListItem: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => <li className="text-secondary leading-relaxed">{children}</li>;

const MarkdownCodeBlock: React.FC<{
	children?: React.ReactNode;
	className?: string;
}> = ({ children, className }) =>
	className ? (
		<code className={className}>{children}</code>
	) : (
		<code className={INLINE_CODE_CLASS}>{children}</code>
	);

const MarkdownPre: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => <pre className={PRE_CLASS}>{children}</pre>;

const MarkdownTable: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => (
	<div className="my-4 overflow-x-auto">
		<table className="min-w-full border-collapse text-[14px] text-secondary">
			{children}
		</table>
	</div>
);

const MarkdownTableHeader: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => (
	<th className="border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-left font-semibold text-primary">
		{children}
	</th>
);

const MarkdownTableCell: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => (
	<td className="border border-[var(--border-default)] px-3 py-2 align-top">
		{children}
	</td>
);

const parseDimension = (
	value: number | string | undefined,
	defaultValue?: string,
): string | undefined => {
	if (value === undefined) return defaultValue;
	return typeof value === "number" ? `${value}px` : value;
};

const parseVal = (v: number | string | undefined): number => {
	if (v === undefined) return Number.NaN;
	return typeof v === "number" ? v : Number.parseInt(v, 10);
};

const isSmallDimensions = (
	width: number | string | undefined,
	height: number | string | undefined,
): boolean => {
	const w = parseVal(width);
	if (w <= 250) return true;
	const h = parseVal(height);
	if (h <= 100) return true;
	return false;
};

const hasKeyword = (text: string | undefined, words: string[]): boolean => {
	if (!text) return false;
	const lower = text.toLowerCase();
	return words.some((word) => lower.includes(word));
};

const isSmallOrInlineImage = (
	src: string | undefined,
	alt: string | undefined,
	width: number | string | undefined,
	height: number | string | undefined,
): boolean => {
	if (isSmallDimensions(width, height)) return true;
	const keywords = ["badge", "shields.io", "logo", "icon", "avatar"];
	return hasKeyword(src, keywords) || hasKeyword(alt, keywords);
};

const getImagePreset = (isSmall: boolean) => {
	if (isSmall) {
		return {
			className: "inline-block align-middle max-w-full mx-0.5 my-0.5",
			sizePreset: "inline" as const,
			minHeight: "20px",
			minWidth: "60px",
		};
	}
	return {
		className: "inline-block align-middle max-w-full my-2",
		sizePreset: "content" as const,
		minHeight: "150px",
		minWidth: "120px",
	};
};

const MarkdownImage: React.FC<{
	src?: string;
	alt?: string;
	width?: number | string;
	height?: number | string;
	title?: string;
	readme: ResolvedReadme | null;
	lang: "en" | "es";
}> = ({ src, alt, width, height, title, readme, lang }) => {
	const isSmall = isSmallOrInlineImage(src, alt, width, height);
	const preset = getImagePreset(isSmall);
	const fallbackAlt = alt || "Markdown image";

	return (
		<LoadingMedia
			lang={lang}
			alt={fallbackAlt}
			className={preset.className}
			display="inline-block"
			sizePreset={preset.sizePreset}
			minHeight={preset.minHeight}
			minWidth={preset.minWidth}
			style={{
				width: parseDimension(width),
				height: parseDimension(height),
			}}
		>
			{({ onLoad, onError, style }) => (
				<img
					src={src ? resolveMarkdownUrl(src, readme, "image") : undefined}
					alt={alt ?? ""}
					width={width}
					height={height}
					title={title}
					loading="lazy"
					onLoad={onLoad}
					onError={onError}
					style={style}
					className="h-auto max-w-full"
				/>
			)}
		</LoadingMedia>
	);
};

const MarkdownLink: React.FC<{
	children?: React.ReactNode;
	href?: string;
	readme: ResolvedReadme | null;
}> = ({ children, href, readme }) => (
	<a {...getMarkdownLinkProps(href, readme)} className={LINK_CLASS}>
		{children}
	</a>
);

export const MarkdownRenderer: React.FC<{
	content: string;
	readme: ResolvedReadme | null;
	lang: "en" | "es";
}> = ({ content, readme, lang }) => {
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
					h1: MarkdownHeading,
					h2: MarkdownHeading,
					h3: MarkdownHeading,
					p: MarkdownParagraph,
					div: MarkdownParagraph,
					span: ({ children }) => <span>{children}</span>,
					br: () => <br />,
					strong: ({ children }) => (
						<strong className="font-bold text-primary">{children}</strong>
					),
					ul: (props) => <MarkdownList {...props} />,
					ol: (props) => <MarkdownList {...props} ordered />,
					li: MarkdownListItem,
					code: MarkdownCodeBlock,
					pre: MarkdownPre,
					table: MarkdownTable,
					th: MarkdownTableHeader,
					td: MarkdownTableCell,
					a: ({ children, href }) => (
						<MarkdownLink href={href} readme={readme}>
							{children}
						</MarkdownLink>
					),
					img: ({ src, alt, width, height, title }) => (
						<MarkdownImage
							src={src}
							alt={alt}
							width={width}
							height={height}
							title={title}
							readme={readme}
							lang={lang}
						/>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};
