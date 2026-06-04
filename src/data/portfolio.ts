import { z } from "zod";
import codeMockup from "../assets/code_mockup.png";
import dashboardMockup from "../assets/dashboard_mockup.png";
import ecommerceMockup from "../assets/ecommerce_mockup.png";
import tech4eDashboard from "../assets/Projects/4E-Dashboard.webp";
import tech4eLanding from "../assets/Projects/4E-Landing.webp";
import tech4eProductos from "../assets/Projects/4E-Productos.webp";
import basicCalculatorImg from "../assets/Projects/BasicTkinterCalculator.webp";
import csCrudIngresos from "../assets/Projects/CS-Crud-de-ingresos.webp";
import csDashboard from "../assets/Projects/CS-Dashboard.webp";
import csLogin from "../assets/Projects/CS-Login.webp";

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
	credentialId: z.string().optional(),
	url: z.string().optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

export const RoleHistorySchema = z.object({
	roleEs: z.string(),
	roleEn: z.string(),
	typeEs: z.string(),
	typeEn: z.string(),
	periodEs: z.string(),
	periodEn: z.string(),
	detailsEs: z.array(z.string()),
	detailsEn: z.array(z.string()),
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
	detailsEs: z.array(z.string()),
	detailsEn: z.array(z.string()),
});

export type Education = z.infer<typeof EducationSchema>;

// Verified portfolio data
export const projects: Project[] = [
	{
		id: "emmax",
		name: "EMMAX",
		descriptionEs:
			"Tienda virtual completa con pasarela de e-commerce y panel de administración.",
		descriptionEn:
			"Complete virtual store with e-commerce gateway and management dashboard.",
		languages: ["C#", "Angular", "SQL Server"],
		images: [ecommerceMockup, dashboardMockup, codeMockup],
		githubUrl: "https://github.com/RayfelO/EMMAX-Angular-.Net-SQLServer",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/EMMAX-Angular-.Net-SQLServer/main/README.MD",
		youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		startDateEs: "oct. 2024",
		startDateEn: "Oct 2024",
		endDateEs: "dic. 2024",
		endDateEn: "Dec 2024",
	},
	{
		id: "avaluo",
		name: "AvaluoBackend",
		descriptionEs:
			"Sistema para la gestión y evaluación de criterios de acreditación educativa ABET.",
		descriptionEn:
			"System for the management and assessment of ABET educational accreditation criteria.",
		languages: ["C#", ".NET Core", "EF Core"],
		images: [dashboardMockup, codeMockup, ecommerceMockup],
		githubUrl: "https://github.com/RayfelO/AvaluoBackend",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/AvaluoBackend/main/README.md",
		youtubeUrl: "https://www.youtube.com/embed/CVELSReGrLg",
		startDateEs: "ago. 2024",
		startDateEn: "Aug 2024",
		endDateEs: "oct. 2024",
		endDateEn: "Oct 2024",
	},
	{
		id: "apihotel",
		name: "ApiHotel",
		descriptionEs:
			"REST API robusta para la administración y reservación de habitaciones de hotel.",
		descriptionEn:
			"Robust REST API for hotel room management and reservations.",
		languages: ["C#", "ASP.NET", "SQL Server"],
		images: [codeMockup, dashboardMockup, ecommerceMockup],
		githubUrl: "https://github.com/RayfelO/ApiHotel",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/ApiHotel/main/README.md",
		startDateEs: "jun. 2024",
		startDateEn: "Jun 2024",
		endDateEs: "jul. 2024",
		endDateEn: "Jul 2024",
	},
	{
		id: "estudiantes",
		name: "Estudiantes-React-Django",
		descriptionEs:
			"Aplicación académica para la administración de estudiantes y reporte de calificaciones.",
		descriptionEn:
			"Academic application for student administration and grade reporting.",
		languages: ["React", "Django", "CSS"],
		images: [dashboardMockup, ecommerceMockup, codeMockup],
		githubUrl: "https://github.com/RayfelO/Estudiantes-React-Django",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/Estudiantes-React-Django/main/README.md",
		youtubeUrl: "https://www.youtube.com/embed/5RSPmlTVYOA",
		startDateEs: "feb. 2024",
		startDateEn: "Feb 2024",
		endDateEs: "abr. 2024",
		endDateEn: "Apr 2024",
	},
	{
		id: "calculator",
		name: "BasicCalculator",
		descriptionEs:
			"Calculadora gráfica desarrollada en Python con backend Flask para cálculos complejos.",
		descriptionEn:
			"Graphical calculator developed in Python with a Flask backend for complex calculations.",
		languages: ["Python", "Flask", "Tkinter"],
		images: [basicCalculatorImg, codeMockup, dashboardMockup],
		githubUrl: "https://github.com/RayfelO/BasicCalculator-Tkinter-Python",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/BasicCalculator-Tkinter-Python/main/README.md",
		startDateEs: "ene. 2023",
		startDateEn: "Jan 2023",
		endDateEs: "feb. 2023",
		endDateEn: "Feb 2023",
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
		titleEs: "Bases de Datos",
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
		id: "cs-asesorias",
		name: "CS-ASESORIAS APP",
		descriptionEs:
			"Sistema de gestión financiera pensado para simplificar la administración de ingresos y egresos mensuales.",
		descriptionEn:
			"Financial management system designed to simplify monthly income and expense management.",
		languages: ["Angular", "Node.js", "MySQL"],
		images: [csDashboard, csCrudIngresos, csLogin],
		startDateEs: "oct. 2024",
		startDateEn: "Oct 2024",
		endDateEs: "mar. 2025",
		endDateEn: "Mar 2025",
		readmeContentEs:
			"# CS-ASESORIAS APP\n\nYa se encuentra operativo el sistema de gestión financiera que desarrollamos en Angular, NodeJs (Express) y MySQL, pensado para simplificar la administración de ingresos y egresos mensuales.\n\n### Principales módulos:\n- **Registro y control de Ingresos**\n- **Gestión de Egresos y Sueldos**\n- **Seguimiento de Inversiones**\n- **Cálculo de Carga Financiera**\n- **Resumen Financiero mensual** con indicadores de estado: 🟢 Pagado / 🔴 No pagado",
		readmeContentEn:
			"# CS-ASESORIAS APP\n\nThe financial management system developed in Angular, Node.js (Express), and MySQL is now operational, designed to simplify monthly income and expense management.\n\n### Key Modules:\n- **Income registration and control**\n- **Expense and Salary management**\n- **Investment tracking**\n- **Financial Load calculation**\n- **Monthly Financial Summary** with status indicators: 🟢 Paid / 🔴 Unpaid",
	},
	{
		id: "four-e-technologys",
		name: "4E Tecnologys",
		descriptionEs:
			"Plataforma de e-commerce para productos tecnológicos (laptops, periféricos y más), diseñada para ofrecer una experiencia completa tanto para clientes como para administradores.",
		descriptionEn:
			"E-commerce platform for technological products (laptops, peripherals, and more), designed to offer a complete experience for both clients and administrators.",
		languages: ["React", "TypeScript", "Django", "Python", "MongoDB"],
		images: [tech4eDashboard, tech4eLanding, tech4eProductos],
		startDateEs: "abr. 2025",
		startDateEn: "Apr 2025",
		endDateEs: "ago. 2025",
		endDateEn: "Aug 2025",
		readmeContentEs:
			"# 4E Tecnologys\n\nPlataforma de e-commerce para productos tecnológicos (laptops, periféricos y más), diseñada para ofrecer una experiencia completa tanto para clientes como para administradores.\n\n### Experiencia para usuarios\n- **Registro e inicio de sesión** (email/contraseña + Google)\n- **Recuperación de contraseña**, perfil e historial de pedidos\n- **Catálogo** con especificaciones técnicas y filtros por categoría/marca\n- **Carrito y checkout** con múltiples métodos de pago (tarjeta, efectivo, transferencia)\n- **Confirmación por correo** y número de seguimiento\n- **Reseñas, calificaciones, cupones y ofertas**\n\n### Panel de administración\n- **CRUD de productos** + gestión de inventario con alertas de stock\n- **Gestión de pedidos** por estado\n- **Usuarios y roles personalizados** + logs de actividad\n- **Reportes de ventas** y ranking de productos",
		readmeContentEn:
			"# 4E Tecnologys\n\nE-commerce platform for technological products (laptops, peripherals, and more), designed to offer a complete experience for both clients and administrators.\n\n### User Experience\n- **Registration and login** (email/password + Google)\n- **Password recovery**, profile, and order history\n- **Catalog** with technical specifications and filters by category/brand\n- **Cart and checkout** with multiple payment methods (card, cash, transfer)\n- **Email confirmation** and tracking number\n- **Reviews, ratings, coupons, and offers**\n\n### Admin Dashboard\n- **Product CRUD** + inventory management with stock alerts\n- **Order management** by status\n- **Custom users and roles** + activity logs\n- **Sales reports** and product rankings",
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
		credentialId: "JSUTDPIX8VXC",
		url: "https://www.coursera.org/verify/JSUTDPIX8VXC",
	},
	{
		id: "sas-data-mining",
		nameEs:
			"SAS – Academic Specialization in Data Mining and Business Intelligence",
		nameEn:
			"SAS – Academic Specialization in Data Mining and Business Intelligence",
		issuer: "SAS – Instituto Tecnológico de Santo Domingo",
		dateEs: "ene. 2025",
		dateEn: "Jan 2025",
		url: "https://www.credly.com/badges/d72fdf14-ee76-4a5e-8ddf-04c2a9b89da5/linked_in_profile",
	},
	{
		id: "fortinet-cybersecurity-fundamentals",
		nameEs: "Fortinet Certified Fundamentals Cybersecurity",
		nameEn: "Fortinet Certified Fundamentals Cybersecurity",
		issuer: "Fortinet",
		dateEs: "Expedición: dic. 2024 · Vencimiento: ene. 2027",
		dateEn: "Issued: Dec 2024 · Expires: Jan 2027",
		url: "https://www.credly.com/badges/aa394742-b52e-46a7-a373-bb9c49fe8292/linked_in_profile",
	},
	{
		id: "fortinet-cybersecurity-associate",
		nameEs: "Fortinet Certified Associate Cybersecurity",
		nameEn: "Fortinet Certified Associate Cybersecurity",
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
		credentialId: "23558248",
	},
	{
		id: "virtual-study-nextu",
		nameEs: "Habilidades para el Estudio Virtual",
		nameEn: "Skills for Virtual Study",
		issuer: "Next U",
		dateEs: "jul. 2020",
		dateEn: "Jul 2020",
		credentialId: "21059030",
	},
	{
		id: "kpi-evaluator",
		nameEs: "Evaluador de Indicadores Clave (KPI)",
		nameEn: "Key Performance Indicator (KPI) Evaluator",
		issuer: "Capacítate para el empleo",
		dateEs: "abr. 2023",
		dateEn: "Apr 2023",
		credentialId: "c82fc6ee-3160-4b92-8238-442c44cccb66",
	},
	{
		id: "process-improvement",
		nameEs: "Mejora de procesos",
		nameEn: "Process Improvement",
		issuer: "Capacítate para el empleo",
		dateEs: "ene. 2023",
		dateEn: "Jan 2023",
		credentialId: "99999d32-c8de-43d9-a8b1-697229123f4d",
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
				typeEs: "Jornada completa",
				typeEn: "Full-time",
				periodEs: "ene. 2025 - actualidad",
				periodEn: "Jan 2025 - Present",
				detailsEs: [
					"Desarrollo y soporte en sistemas de facturación electrónica y Oracle Database.",
					"Liderazgo en la gestión de seguridad de datos y disponibilidad del sistema de facturación.",
				],
				detailsEn: [
					"Development and support on electronic invoicing systems and Oracle Database.",
					"Leadership in data security management and invoicing system availability.",
				],
				skills: ["Oracle Database", "Facturación Electrónica", "SQL", "PL/SQL"],
				current: true,
			},
			{
				roleEs: "Pasante programador",
				roleEn: "Programming Intern",
				typeEs: "Contrato de prácticas",
				typeEn: "Internship contract",
				periodEs: "ago. 2024 - ene. 2025",
				periodEn: "Aug 2024 - Jan 2025",
				detailsEs: [
					"Apoyo en el desarrollo y optimización de consultas SQL y PL/SQL en Oracle Database.",
					"Colaboración con el equipo de TI en tareas de mantenimiento del backend.",
				],
				detailsEn: [
					"Support in development and optimization of SQL and PL/SQL queries in Oracle Database.",
					"Collaboration with the IT team on backend maintenance tasks.",
				],
				skills: ["Oracle Database", "SQL", "PL/SQL"],
				current: false,
			},
		],
	},
	{
		id: "freelance-software-engineer",
		company: "Profesional Independiente",
		locationEs: "República Dominicana · En remoto",
		locationEn: "Dominican Republic · Remote",
		roles: [
			{
				roleEs: "Freelance Software Engineer",
				roleEn: "Freelance Software Engineer",
				typeEs: "Profesional independiente",
				typeEn: "Freelance",
				periodEs: "oct. 2024 - actualidad",
				periodEn: "Oct 2024 - Present",
				detailsEs: [
					"Desarrollo de interfaces dinámicas y modulares utilizando Angular CLI y React.",
					"Diseño e implementación de servicios backend con Node.js y APIs REST robustas.",
				],
				detailsEn: [
					"Development of dynamic and modular interfaces using Angular CLI and React.",
					"Design and implementation of backend services with Node.js and robust REST APIs.",
				],
				skills: ["Node.js", "Angular", "React", "TypeScript", "JavaScript"],
				current: true,
			},
		],
	},
];

export const educations: Education[] = [
	{
		id: "intec-computer-science",
		degreeEs: "Grado, Ciencias de la Computación (Ingeniería)",
		degreeEn: "Bachelor of Science in Computer Science",
		institution: "Instituto Tecnológico de Santo Domingo (INTEC)",
		periodEs: "nov. 2021 – abr. 2026",
		periodEn: "Nov 2021 – Apr 2026",
		detailsEs: [
			"Enfoque en Ingeniería de Software, Estructuras de Datos, Algoritmos y Bases de Datos.",
			"Especialización Académica en Minería de Datos y Business Intelligence en conjunto con SAS.",
		],
		detailsEn: [
			"Focus on Software Engineering, Data Structures, Algorithms, and Databases.",
			"Academic Specialization in Data Mining and Business Intelligence in collaboration with SAS.",
		],
	},
	{
		id: "copphu-it",
		degreeEs: "Técnico en Informática",
		degreeEn: "IT Technician",
		institution: "Colegio Preuniversitario Pedro Henríquez Ureña (COPPHU)",
		periodEs: "ago. 2016 – jul. 2021",
		periodEn: "Aug 2016 – Jul 2021",
		detailsEs: [
			"Formación técnica especializada en desarrollo de software, C# y desarrollo web básico.",
		],
		detailsEn: [
			"Specialized technical training in software development, C#, and basic web development.",
		],
	},
];
