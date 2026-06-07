import { z } from "zod";

const TranslationSchema = z.object({
	hero: z.object({
		role: z.string(),
		bio: z.string(),
		status: z.string(),
	}),
	sections: z.object({
		home: z.string(),
		stack: z.string(),
		github: z.string(),
		openSource: z.string(),
		projects: z.string(),
		projectsCount: z.string(),
		privateWork: z.string(),
		contact: z.string(),
		builtWith: z.string(),
		builtWithDesc: z.string(),
		privateWorkSub: z.string(),
		certifications: z.string(),
		experience: z.string(),
		education: z.string(),
	}),
	projects: z.object({
		viewOnGithub: z.string(),
		availableOnRequest: z.string(),
		underNDA: z.string(),
		openSourceTab: z.string(),
		privateTab: z.string(),
	}),
	certifications: z.object({
		showCredential: z.string(),
	}),
	contactModal: z.object({
		title: z.string(),
		subtitle: z.string(),
		reasons: z.array(z.string()),
		namePlaceholder: z.string(),
		emailPlaceholder: z.string(),
		messagePlaceholder: z.string(),
		submitButton: z.string(),
		submittingButton: z.string(),
		successMessage: z.string(),
		errorMessage: z.string(),
	}),
});

export type Translations = z.infer<typeof TranslationSchema>;

export const translations = {
	en: {
		hero: {
			role: "Software Engineer",
			bio: "Software Engineer (INTEC) focused on technological solutions that optimize business processes. Experienced in web, mobile, and desktop applications, scalable backends with .NET, software architecture, and algorithms. Skilled in project leadership and strategic vision.",
			status: "Open to opportunities",
		},
		sections: {
			home: "Home",
			stack: "Stack",
			github: "GitHub",
			openSource: "Open Source",
			projects: "Projects",
			projectsCount: "5 projects",
			privateWork: "Private Work",
			privateWorkSub: "Available upon request · NDA protected",
			contact: "Contact",
			builtWith: "Built with",
			builtWithDesc: "This portfolio was built with these tools",
			certifications: "Certifications",
			experience: "Work Experience",
			education: "Education",
		},
		projects: {
			viewOnGithub: "View on GitHub",
			availableOnRequest: "Available upon request",
			underNDA: "NDA protected",
			openSourceTab: "Open Source",
			privateTab: "Private Work",
		},
		certifications: {
			showCredential: "View Credential",
		},
		contactModal: {
			title: "Nice to meet you",
			subtitle:
				"Pick what this is about, leave a short message, and I'll get back to you as soon as possible.",
			reasons: ["Job offer", "Collaboration", "Other"],
			namePlaceholder: "Your name",
			emailPlaceholder: "Email address",
			messagePlaceholder: "What would you like to discuss?",
			submitButton: "Send message",
			submittingButton: "Sending...",
			successMessage: "Message sent. I'll get back to you soon.",
			errorMessage: "Something went wrong. Please try again.",
		},
	},
	es: {
		hero: {
			role: "Ingeniero de Software",
			bio: "Ingeniero de Software (INTEC) enfocado en soluciones tecnológicas que optimizan procesos de negocio. Experiencia en aplicaciones web, móviles y de escritorio, backend escalable en .NET, arquitectura y algoritmos. Hábil en liderazgo de proyectos y visión estratégica.",
			status: "Abierto a oportunidades",
		},
		sections: {
			home: "Inicio",
			stack: "Stack",
			github: "GitHub",
			openSource: "Open Source",
			projects: "Proyectos",
			projectsCount: "5 proyectos",
			privateWork: "Proyectos Privados",
			privateWorkSub: "Disponible bajo solicitud · Protegido por NDA",
			contact: "Contacto",
			builtWith: "Construido con",
			builtWithDesc: "Este portafolio fue construido con estas herramientas",
			certifications: "Certificaciones",
			experience: "Experiencia Laboral",
			education: "Educación",
		},
		projects: {
			viewOnGithub: "Ver en GitHub",
			availableOnRequest: "Disponible bajo solicitud",
			underNDA: "Bajo NDA",
			openSourceTab: "Código Abierto",
			privateTab: "Proyectos Privados",
		},
		certifications: {
			showCredential: "Ver Credential",
		},
		contactModal: {
			title: "Un gusto saber de ti",
			subtitle:
				"Elige el motivo, deja un mensaje breve y te responderé lo antes posible.",
			reasons: ["Oferta de trabajo", "Colaboración", "Otro"],
			namePlaceholder: "Tu nombre",
			emailPlaceholder: "Correo electrónico",
			messagePlaceholder: "¿Qué te gustaría conversar?",
			submitButton: "Enviar mensaje",
			submittingButton: "Enviando...",
			successMessage: "¡Mensaje enviado! Te responderé pronto.",
			errorMessage: "Algo salió mal. Inténtalo de nuevo.",
		},
	},
} satisfies Record<"en" | "es", Translations>;
