import { z } from "zod";
import tech4eDashboard from "../assets/Projects/4E-Dashboard.webp";
import tech4eLanding from "../assets/Projects/4E-Landing.webp";
import tech4eProductos from "../assets/Projects/4E-Productos.webp";
import apiHotelImg from "../assets/Projects/APIHotel.webp";
import avaluoBackend from "../assets/Projects/Avaluo-Backend.webp";
import avaluoFrontend from "../assets/Projects/Avaluo-Frontend.webp";
import avaluoInformePDF from "../assets/Projects/Avaluo-InformePDF.webp";
import basicCalculatorImg from "../assets/Projects/BasicTkinterCalculator.webp";
import csCrudIngresos from "../assets/Projects/CS-Crud-de-ingresos.webp";
import csDashboard from "../assets/Projects/CS-Dashboard.webp";
import csLogin from "../assets/Projects/CS-Login.webp";
import emmaxCarrousel from "../assets/Projects/emmax-carrousel.webp";
import emmaxCatalogo from "../assets/Projects/emmax-catalogo.webp";
import estudianteAdmin from "../assets/Projects/estudiante-admin.webp";
import estudianteEstudiante from "../assets/Projects/estudiante-estudiante.webp";
import estudianteLanding from "../assets/Projects/estudiante-landing.webp";
import estudianteProfesor from "../assets/Projects/estudiante-profesor.webp";

// Zod schemas
export const ProjectSchema = z.object({
	id: z.string(),
	name: z.string(),
	descriptionEs: z.string(),
	descriptionEn: z.string(),
	languages: z.array(z.string()),
	images: z.array(z.string()),
	liveUrl: z.string().optional(),
	githubUrl: z.string().optional(),
	readmeUrl: z.string().optional(),
	readmeContentEs: z.string().optional(),
	readmeContentEn: z.string().optional(),
	youtubeUrl: z.string().optional(),
	startDateEs: z.string(),
	startDateEn: z.string(),
	endDateEs: z.string().optional(),
	endDateEn: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const TechItemSchema = z.object({
	name: z.string(),
	url: z.string(),
	iconName: z.string(),
});

export const TechGroupSchema = z.object({
	titleEs: z.string(),
	titleEn: z.string(),
	items: z.array(TechItemSchema),
});

export type TechGroup = z.infer<typeof TechGroupSchema>;

export const CertificationSchema = z.object({
	id: z.string(),
	nameEs: z.string(),
	nameEn: z.string(),
	issuer: z.string(),
	dateEs: z.string(),
	dateEn: z.string(),
	url: z.string().optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

export const RoleHistorySchema = z.object({
	roleEs: z.string(),
	roleEn: z.string(),
	periodEs: z.string(),
	periodEn: z.string(),
	detailsEs: z.string(),
	detailsEn: z.string(),
	skills: z.array(z.string()),
	current: z.boolean(),
});

export const ExperienceSchema = z.object({
	id: z.string(),
	company: z.string(),
	locationEs: z.string(),
	locationEn: z.string(),
	roles: z.array(RoleHistorySchema),
});

export type Experience = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
	id: z.string(),
	degreeEs: z.string(),
	degreeEn: z.string(),
	institution: z.string(),
	periodEs: z.string(),
	periodEn: z.string(),
	detailsEs: z.string(),
	detailsEn: z.string(),
});

export type Education = z.infer<typeof EducationSchema>;

// Verified portfolio data
export const projects: Project[] = [
	{
		id: "avaluo",
		name: "Avaluo",
		descriptionEs:
			"🚀 Sistema Avalúo: plataforma diseñada para automatizar y organizar los procesos de acreditación ABET en las carreras de Ingeniería de Software, Ciberseguridad y Sistemas en INTEC, centralizando evidencias, métricas y reportes para auditorías y mejora continua.",
		descriptionEn:
			"🚀 Avaluo System: platform designed to automate and organize ABET accreditation processes for Software Engineering, Cybersecurity, and Systems majors at INTEC, centralizing evidence, metrics, and reports for audits and continuous improvement.",
		languages: ["C#", "ASP.NET Web API", "Next.js"],
		images: [avaluoFrontend, avaluoBackend, avaluoInformePDF],
		githubUrl: "https://github.com/RayfelO/AvaluoBackend",
		youtubeUrl: "https://www.youtube.com/embed/CVELSReGrLg",
		startDateEs: "5 ago. 2024",
		startDateEn: "Aug 5, 2024",
		endDateEs: "18 abr. 2025",
		endDateEn: "Apr 18, 2025",
		readmeContentEs:
			"# Sistema Avalúo\n\nAsociado con Instituto Tecnológico de Santo Domingo\n\nPlataforma diseñada para automatizar y organizar los procesos de acreditación ABET en las carreras de Ingeniería de Software, Ciberseguridad y Sistemas en INTEC, centralizando evidencias, métricas y reportes para auditorías y mejora continua.\n\n### ✅ Qué hace\n- **Genera reportes clave**: desempeño de Student Outcomes (SO) por Performance Indicators (PI) (trimestral), egresados, empleadores, profesorado y PEO.\n- **Permite un flujo por roles**: coordinadores (asignan SO y planifican evaluaciones), profesores (evalúan con rúbrica digital y reciben notificaciones), supervisores (controlan entregas por SO), auxiliares (convierten programas a formato syllabux) y administradores (usuarios, permisos e integraciones).\n- **Ofrece dashboards personalizados** y registro de auditoría para trazabilidad de cambios en datos clave.\n\n### 🔌 Integraciones institucionales\n- Moodle (web service), Sistema Académico (API) y Microsoft Forms/Power Automate para encuestas y recolección automática de información.",
		readmeContentEn:
			"# Avaluo System\n\nAssociated with Instituto Tecnológico de Santo Domingo\n\nPlatform designed to automate and organize ABET accreditation processes for Software Engineering, Cybersecurity, and Systems majors at INTEC, centralizing evidence, metrics, and reports for audits and continuous improvement.\n\n### ✅ What it does\n- **Generates key reports**: Student Outcomes (SO) performance by Performance Indicators (PI) (termly), alumni, employers, faculty, and PEO.\n- **Enables role-based workflow**: coordinators (assign SO and plan assessments), professors (assess with digital rubrics and receive notifications), supervisors (track submissions per SO), assistants (convert curricula to syllabux format), and administrators (users, permissions, and integrations).\n- **Offers customized dashboards** and audit logs for traceability of changes in key data.\n\n### 🔌 Institutional integrations\n- Moodle (web service), Academic System (API), and Microsoft Forms/Power Automate for surveys and automated data collection.",
	},
	{
		id: "emmax",
		name: "EMMAX",
		descriptionEs:
			"Tienda virtual completa con pasarela de e-commerce y panel de administración.",
		descriptionEn:
			"Complete virtual store with e-commerce gateway and management dashboard.",
		languages: ["C#", "Angular", "SQL Server"],
		images: [emmaxCatalogo, emmaxCarrousel],
		githubUrl: "https://github.com/RayfelO/EMMAX-Angular-.Net-SQLServer",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/EMMAX-Angular-.Net-SQLServer/main/README.MD",
		startDateEs: "21 ago. 2023",
		startDateEn: "Aug 21, 2023",
		endDateEs: "19 oct. 2024",
		endDateEn: "Oct 19, 2024",
	},
	{
		id: "calculator",
		name: "BasicCalculator",
		descriptionEs:
			"Una aplicación de escritorio desarrollada con Tkinter y una calculadora web construida con Flask. Ambas permiten realizar operaciones matemáticas básicas de forma sencilla.",
		descriptionEn:
			"A desktop application developed with Tkinter and a web calculator built with Flask. Both allow performing basic mathematical operations easily.",
		languages: ["Python", "Flask", "Tkinter"],
		images: [basicCalculatorImg],
		liveUrl: "https://basictkintercalculator.vercel.app",
		githubUrl:
			"https://github.com/RayfelO/BasicCalculator-Python-Flask-Tkinter",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/BasicCalculator-Python-Flask-Tkinter/main/README.md",
		startDateEs: "15 sep. 2024",
		startDateEn: "Sep 15, 2024",
		endDateEs: "13 oct. 2024",
		endDateEn: "Oct 13, 2024",
	},
	{
		id: "apihotel",
		name: "ApiHotel",
		descriptionEs:
			"REST API robusta para la administración y reservación de habitaciones de hotel.",
		descriptionEn:
			"Robust REST API for hotel room management and reservations.",
		languages: ["C#", "ASP.NET", "SQL Server"],
		images: [apiHotelImg],
		githubUrl: "https://github.com/RayfelO/ApiHotel-.Net-SQLServer",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/ApiHotel-.Net-SQLServer/main/README.md",
		startDateEs: "3 may. 2023",
		startDateEn: "May 3, 2023",
		endDateEs: "20 jul. 2023",
		endDateEn: "Jul 20, 2023",
	},
	{
		id: "estudiantes",
		name: "Estudiantes-main",
		descriptionEs:
			"Sistema de Gestión Académica — Aplicación web para gestionar procesos académicos universitarios. Permite administrar estudiantes, asignaturas y calificaciones con operaciones CRUD, conversión de notas numéricas a letras (A–F) y generación de un ranking académico por índice. Facilita la interacción entre estudiantes, profesores y administradores con una interfaz clara y un flujo de información centralizado.",
		descriptionEn:
			"Academic Management System — Web application to manage university academic processes. It allows managing students, subjects, and grades with CRUD operations, converting numeric grades to letter grades (A–F), and generating an academic ranking by GPA. It facilitates interaction among students, professors, and administrators with a clear interface and a centralized information flow.",
		languages: ["Python", "Django", "React.js", "Bootstrap"],
		images: [
			estudianteLanding,
			estudianteEstudiante,
			estudianteProfesor,
			estudianteAdmin,
		],
		githubUrl: "https://github.com/RayfelO/Estudiantes-React-Django",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/Estudiantes-React-Django/main/README.md",
		youtubeUrl: "https://www.youtube.com/embed/5RSPmlTVYOA",
		startDateEs: "10 mar. 2023",
		startDateEn: "Mar 10, 2023",
		endDateEs: "29 abr. 2023",
		endDateEn: "Apr 29, 2023",
	},
];

export const techStack: TechGroup[] = [
	{
		titleEs: "Backend",
		titleEn: "Backend",
		items: [
			{
				name: "C#",
				url: "https://learn.microsoft.com/en-us/dotnet/csharp/",
				iconName: "csharp",
			},
			{
				name: "Rust",
				url: "https://www.rust-lang.org/",
				iconName: "rust",
			},
			{
				name: "ASP.NET",
				url: "https://dotnet.microsoft.com/apps/aspnet",
				iconName: "aspnet",
			},
			{
				name: "Node.js",
				url: "https://nodejs.org/",
				iconName: "nodejs",
			},
		],
	},
	{
		titleEs: "Frontend",
		titleEn: "Frontend",
		items: [
			{
				name: "Angular",
				url: "https://angular.dev/",
				iconName: "angular",
			},
			{
				name: "React",
				url: "https://react.dev/",
				iconName: "react",
			},
			{
				name: "TypeScript",
				url: "https://www.typescriptlang.org/",
				iconName: "typescript",
			},
			{
				name: "JavaScript",
				url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
				iconName: "javascript",
			},
		],
	},
	{
		titleEs: "Base de datos",
		titleEn: "Databases",
		items: [
			{
				name: "SQL Server",
				url: "https://www.microsoft.com/en-us/sql-server",
				iconName: "sqlserver",
			},
			{
				name: "MongoDB",
				url: "https://www.mongodb.com/",
				iconName: "mongodb",
			},
			{
				name: "MySQL",
				url: "https://www.mysql.com/",
				iconName: "mysql",
			},
			{
				name: "Oracle",
				url: "https://www.oracle.com/database/",
				iconName: "oracle",
			},
		],
	},
];

export const privateProjects: Project[] = [
	{
		id: "four-e-technologys",
		name: "4E Tecnologys",
		descriptionEs:
			"Plataforma de e-commerce para productos tecnológicos (laptops, periféricos y más), diseñada para ofrecer una experiencia completa tanto para clientes como para administradores.",
		descriptionEn:
			"E-commerce platform for technological products (laptops, peripherals, and more), designed to offer a complete experience for both clients and administrators.",
		languages: ["React", "TypeScript", "Django", "Python", "MongoDB"],
		images: [tech4eDashboard, tech4eLanding, tech4eProductos],
		liveUrl: "https://4etecnologys.com/",
		startDateEs: "abr. 2025",
		startDateEn: "Apr 2025",
		endDateEs: "ago. 2025",
		endDateEn: "Aug 2025",
		readmeContentEs:
			"# 4E Tecnologys\n\nPlataforma de e-commerce para productos tecnológicos (laptops, periféricos y más), diseñada para ofrecer una experiencia completa tanto para clientes como para administradores.\n\n### Experiencia para usuarios\n- **Registro e inicio de sesión** (email/contraseña + Google)\n- **Recuperación de contraseña**, perfil e historial de pedidos\n- **Catálogo** con especificaciones técnicas y filtros por categoría/marca\n- **Carrito y checkout** con múltiples métodos de pago (tarjeta, efectivo, transferencia)\n- **Confirmación por correo** y número de seguimiento\n- **Reseñas, calificaciones, cupones y ofertas**\n\n### Panel de administración\n- **CRUD de productos** + gestión de inventario con alertas de stock\n- **Gestión de pedidos** por estado\n- **Usuarios y roles personalizados** + logs de actividad\n- **Reportes de ventas** y ranking de productos",
		readmeContentEn:
			"# 4E Tecnologys\n\nE-commerce platform for technological products (laptops, peripherals, and more), designed to offer a complete experience for both clients and administrators.\n\n### User Experience\n- **Registration and login** (email/password + Google)\n- **Password recovery**, profile, and order history\n- **Catalog** with technical specifications and filters by category/brand\n- **Cart and checkout** with multiple payment methods (card, cash, transfer)\n- **Email confirmation** and tracking number\n- **Reviews, ratings, coupons, and offers**\n\n### Admin Dashboard\n- **Product CRUD** + inventory management with stock alerts\n- **Order management** by status\n- **Custom users and roles** + activity logs\n- **Sales reports** and product rankings",
	},
	{
		id: "cs-asesorias",
		name: "CS-ASESORIAS APP",
		descriptionEs:
			"Sistema de gestión financiera chileno pensado para simplificar la administración de ingresos y egresos mensuales.",
		descriptionEn:
			"Chilean financial management system designed to simplify monthly income and expense management.",
		languages: ["Angular", "Node.js", "MySQL"],
		images: [csDashboard, csCrudIngresos, csLogin],
		liveUrl: "https://app.csasesorias.cl/",
		startDateEs: "oct. 2024",
		startDateEn: "Oct 2024",
		endDateEs: "mar. 2025",
		endDateEn: "Mar 2025",
		readmeContentEs:
			"# CS-ASESORIAS APP\n\nYa se encuentra operativo el sistema de gestión financiera que desarrollamos en Angular, NodeJs (Express) y MySQL, pensado para simplificar la administración de ingresos y egresos mensuales.\n\n### Principales módulos:\n- **Registro y control de Ingresos**\n- **Gestión de Egresos y Sueldos**\n- **Seguimiento de Inversiones**\n- **Cálculo de Carga Financiera**\n- **Resumen Financiero mensual** con indicadores de estado: 🟢 Pagado / 🔴 No pagado",
		readmeContentEn:
			"# CS-ASESORIAS APP\n\nThe financial management system developed in Angular, Node.js (Express), and MySQL is now operational, designed to simplify monthly income and expense management.\n\n### Key Modules:\n- **Income registration and control**\n- **Expense and Salary management**\n- **Investment tracking**\n- **Financial Load calculation**\n- **Monthly Financial Summary** with status indicators: 🟢 Paid / 🔴 Unpaid",
	},
];

export const certifications: Certification[] = [
	{
		id: "version-control",
		nameEs: "Control de versión",
		nameEn: "Version Control",
		issuer: "Meta",
		dateEs: "abr. 2025",
		dateEn: "Apr 2025",
		url: "https://www.coursera.org/verify/JSUTDPIX8VXC",
	},
	{
		id: "sas-data-mining",
		nameEs:
			"Especialización académica en minería de datos e inteligencia empresarial",
		nameEn: "Academic Specialization in Data Mining and Business Intelligence",
		issuer: "SAS",
		dateEs: "ene. 2025",
		dateEn: "Jan 2025",
		url: "https://www.credly.com/badges/d72fdf14-ee76-4a5e-8ddf-04c2a9b89da5/linked_in_profile",
	},
	{
		id: "fortinet-cybersecurity-fundamentals",
		nameEs: "FCF - Fortinet Certified Fundamentals en Ciberseguridad",
		nameEn: "FCF - Fortinet Certified Fundamentals Cybersecurity",
		issuer: "Fortinet",
		dateEs: "Expedición: dic. 2024 · Vencimiento: ene. 2027",
		dateEn: "Issued: Dec 2024 · Expires: Jan 2027",
		url: "https://www.credly.com/badges/aa394742-b52e-46a7-a373-bb9c49fe8292/linked_in_profile",
	},
	{
		id: "fortinet-cybersecurity-associate",
		nameEs: "FCA - Fortinet Certified Associate en Ciberseguridad",
		nameEn: "FCA - Fortinet Certified Associate Cybersecurity",
		issuer: "Fortinet",
		dateEs: "Expedición: ene. 2025 · Vencimiento: ene. 2027",
		dateEn: "Issued: Jan 2025 · Expires: Jan 2027",
		url: "https://www.credly.com/badges/56c13186-2577-4d4d-8dd0-63577817f5d1/linked_in_profile",
	},
	{
		id: "web-front-end-nextu",
		nameEs: "Curso Intensivo en Web Front End",
		nameEn: "Intensive Web Front End Course",
		issuer: "Next U",
		dateEs: "sept. 2020",
		dateEn: "Sep 2020",
	},
	{
		id: "virtual-study-nextu",
		nameEs: "Habilidades para el Estudio Virtual",
		nameEn: "Skills for Virtual Study",
		issuer: "Next U",
		dateEs: "jul. 2020",
		dateEn: "Jul 2020",
	},
	{
		id: "kpi-evaluator",
		nameEs: "Evaluador de Indicadores Clave (KPI)",
		nameEn: "Key Performance Indicator (KPI) Evaluator",
		issuer: "Capacítate para el empleo",
		dateEs: "abr. 2023",
		dateEn: "Apr 2023",
	},
	{
		id: "process-improvement",
		nameEs: "Mejora de procesos",
		nameEn: "Process Improvement",
		issuer: "Capacítate para el empleo",
		dateEs: "ene. 2023",
		dateEn: "Jan 2023",
	},
];

export const experiences: Experience[] = [
	{
		id: "mps-dominicana",
		company: "MPS Dominicana S.R.L",
		locationEs: "República Dominicana · Presencial",
		locationEn: "Dominican Republic · On-site",
		roles: [
			{
				roleEs: "Ingeniero de software",
				roleEn: "Software Engineer",
				periodEs: "ene. 2025 - actualidad",
				periodEn: "Jan 2025 - Present",
				detailsEs:
					"Desarrollo de aplicaciones empresariales y soluciones digitales para diferentes necesidades, incluyendo aplicaciones móviles, portales web, páginas corporativas, sistemas de tickets y herramientas de gestión de backups.",
				detailsEn:
					"Development of enterprise applications and digital solutions for various needs, including mobile apps, web portals, corporate websites, ticketing systems, and backup management tools.",
				skills: ["Oracle Database", "Facturación Electrónica", "SQL", "PL/SQL"],
				current: true,
			},
			{
				roleEs: "Pasante programador",
				roleEn: "Programming Intern",
				periodEs: "ago. 2024 - ene. 2025",
				periodEn: "Aug 2024 - Jan 2025",
				detailsEs:
					"Responsable del mantenimiento y mejora continua de una integración de facturación electrónica conectada al ERP Oracle de la empresa.",
				detailsEn:
					"Responsible for the maintenance and continuous improvement of an electronic invoicing integration connected to the company's Oracle ERP.",
				skills: ["Oracle Database", "SQL", "PL/SQL"],
				current: false,
			},
		],
	},
];

export const educations: Education[] = [
	{
		id: "intec-computer-science",
		degreeEs: "Ingeniería de Software",
		degreeEn: "Software Engineering",
		institution: "Instituto Tecnológico de Santo Domingo (INTEC)",
		periodEs: "nov. 2021 – abr. 2026",
		periodEn: "Nov 2021 – Apr 2026",
		detailsEs:
			"Formación en Ingeniería de Software enfocada en el análisis, diseño, desarrollo y mantenimiento de softwares, con bases en programación, estructuras de datos, algoritmos, bases de datos y arquitectura de software.",
		detailsEn:
			"Software Engineering training focused on the analysis, design, development, and maintenance of software, with foundations in programming, data structures, algorithms, databases, and software architecture.",
	},
	{
		id: "copphu-it",
		degreeEs: "Técnico en Informática",
		degreeEn: "IT Technician",
		institution: "Colegio Preuniversitario Pedro Henríquez Ureña (COPPHU)",
		periodEs: "ago. 2016 – jul. 2021",
		periodEn: "Aug 2016 – Jul 2021",
		detailsEs:
			"Formación técnica especializada en desarrollo de software, C# y desarrollo web básico.",
		detailsEn:
			"Specialized technical training in software development, C#, and basic web development.",
	},
];
