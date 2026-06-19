import type { Translations } from "../../i18n/translations";

export const getNavigationSections = (t: Translations) => [
	{ id: "inicio", label: t.sections.home },
	{ id: "tecnologias", label: t.sections.stack },
	{ id: "certificaciones", label: t.sections.certifications },
	{ id: "proyectos", label: t.sections.projects },
	{ id: "experiencia", label: t.sections.experience },
	{ id: "educacion", label: t.sections.education },
];
