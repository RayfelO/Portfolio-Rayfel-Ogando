import { z } from "zod";
import codeMockup from "../assets/code_mockup.png";
import dashboardMockup from "../assets/dashboard_mockup.png";
import ecommerceMockup from "../assets/ecommerce_mockup.png";

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
	},
	{
		id: "calculator",
		name: "BasicCalculator",
		descriptionEs:
			"Calculadora gráfica desarrollada en Python con backend Flask para cálculos complejos.",
		descriptionEn:
			"Graphical calculator developed in Python with a Flask backend for complex calculations.",
		languages: ["Python", "Flask", "Tkinter"],
		images: [codeMockup, ecommerceMockup, dashboardMockup],
		githubUrl: "https://github.com/RayfelO/BasicCalculator-Tkinter-Python",
		readmeUrl:
			"https://raw.githubusercontent.com/RayfelO/BasicCalculator-Tkinter-Python/main/README.md",
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
		id: "enterprise-system",
		name: "Enterprise Corporate System",
		descriptionEs:
			"Sistema de facturación corporativa y gestión de inventario para grandes operaciones comerciales.",
		descriptionEn:
			"Corporate invoicing and inventory management system for large commercial operations.",
		languages: ["C#", "SQL Server", "Angular"],
		images: [ecommerceMockup, dashboardMockup, codeMockup],
		liveUrl: "https://enterprise-demo.rayfel.dev",
		readmeContentEs:
			"# Sistema Corporativo Enterprise\n\nSistema integral diseñado para automatizar y optimizar las operaciones comerciales medianas y grandes, incluyendo facturación electrónica dominicana, gestión de almacenes en tiempo real y reportería financiera consolidada.\n\n### Tecnologías Utilizadas\n- **Backend:** C# con .NET Core, EF Core\n- **Frontend:** Angular, TailwindCSS\n- **Bases de Datos:** SQL Server\n\n### Características Clave\n- Módulo de facturación electrónica certificado por la DGII.\n- Control de stock multi-almacén con alertas de reabastecimiento automático.\n- Dashboard de KPIs financieros interactivo.",
		readmeContentEn:
			"# Enterprise Corporate System\n\nComprehensive system designed to automate and optimize mid to large-scale business operations, including Dominican electronic invoicing, real-time warehouse management, and consolidated financial reporting.\n\n### Technologies Used\n- **Backend:** C# with .NET Core, EF Core\n- **Frontend:** Angular, TailwindCSS\n- **Databases:** SQL Server\n\n### Key Features\n- Electronic invoicing module certified by DGII.\n- Multi-warehouse inventory control with auto-restock alerts.\n- Interactive financial KPIs dashboard.",
	},
	{
		id: "internal-control",
		name: "Internal Control Dashboard",
		descriptionEs:
			"Panel analítico para el monitoreo de indicadores de desempeño y auditorías de seguridad.",
		descriptionEn:
			"Analytical dashboard for monitoring performance indicators and security audits.",
		languages: ["React", ".NET", "MongoDB"],
		images: [dashboardMockup, codeMockup, ecommerceMockup],
		liveUrl: "https://control-demo.rayfel.dev",
		readmeContentEs:
			"# Dashboard de Control Interno\n\nPlataforma de inteligencia de negocio para el monitoreo continuo de métricas operacionales, auditorías de seguridad de bases de datos y control de accesos corporativos.\n\n### Tecnologías Utilizadas\n- **Backend:** .NET Core REST API\n- **Frontend:** React, TailwindCSS, Recharts\n- **Bases de Datos:** MongoDB\n\n### Características Clave\n- Gráficos interactivos de rendimiento y tiempo de respuesta en tiempo real.\n- Auditoría automatizada de transacciones sospechosas y alertas de seguridad.\n- Panel de configuración de perfiles y permisos de usuario estructurado.",
		readmeContentEn:
			"# Internal Control Dashboard\n\nBusiness intelligence platform for continuous monitoring of operational metrics, database security audits, and corporate access control.\n\n### Technologies Used\n- **Backend:** .NET Core REST API\n- **Frontend:** React, TailwindCSS, Recharts\n- **Databases:** MongoDB\n\n### Key Features\n- Real-time interactive performance and response time charts.\n- Automated auditing of suspicious transactions and security alerts.\n- Structured user profile and permission configuration panel.",
	},
	{
		id: "nda-app",
		name: "NDA Protected App",
		descriptionEs:
			"Servicio backend de alto rendimiento para el procesamiento de transacciones financieras masivas.",
		descriptionEn:
			"High-performance backend service for massive financial transaction processing.",
		languages: ["TypeScript", "Node.js", "Oracle"],
		images: [codeMockup, dashboardMockup, ecommerceMockup],
		readmeContentEs:
			"# Aplicación Protegida por NDA\n\nEste proyecto es una aplicación patentada desarrollada bajo un estricto acuerdo de no divulgación (NDA). Ofrece un motor de procesamiento de transacciones financieras de alta disponibilidad con colas de mensajería asíncronas y caching en memoria.\n\n### Tecnologías Utilizadas\n- **Backend:** Node.js, NestJS, TypeScript\n- **Bases de Datos:** Oracle Database\n- **Infraestructura:** Docker, Redis\n\n### Características Clave\n- Procesamiento asíncrono con colas de mensajes de alta velocidad.\n- Sistema de auditoría encriptado de extremo a extremo.\n- Optimización de consultas complejas PL/SQL para reportes transaccionales.",
		readmeContentEn:
			"# NDA Protected App\n\nThis project is a proprietary application developed under a strict Non-Disclosure Agreement (NDA). It delivers a high-availability financial transaction processing engine with asynchronous message queuing and in-memory caching.\n\n### Technologies Used\n- **Backend:** Node.js, NestJS, TypeScript\n- **Databases:** Oracle Database\n- **Infrastructure:** Docker, Redis\n\n### Key Features\n- Asynchronous processing with high-velocity message queues.\n- End-to-end encrypted auditing system.\n- Optimization of complex PL/SQL queries for transactional reporting.",
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
