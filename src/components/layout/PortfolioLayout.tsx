import type React from "react";
import type { Translations } from "../../i18n/translations";
import { AvatarCard } from "../cards/AvatarCard";
import { CertificationsCard } from "../cards/CertificationsCard";
import { ContactCard } from "../cards/ContactCard";
import { EducationCard } from "../cards/EducationCard";
import { ExperienceCard } from "../cards/ExperienceCard";
import { HeroCard } from "../cards/HeroCard";
import { ProjectsCard } from "../cards/ProjectsCard";
import { TechStackCard } from "../cards/TechStackCard";
import { BentoGrid } from "./BentoGrid";
import { NavigationIndex } from "./NavigationIndex";

interface PortfolioLayoutProps {
	t: Translations;
	lang: "en" | "es";
	onOpenModal: () => void;
}

export const PortfolioLayout: React.FC<PortfolioLayoutProps> = ({
	t,
	lang,
	onOpenModal,
}) => {
	return (
		<div className="w-full max-w-[1100px] mx-auto relative">
			<BentoGrid>
				<AvatarCard
					id="inicio"
					lang={lang}
					className="order-1 min-[900px]:order-1"
				/>
				<HeroCard t={t} className="order-2 min-[900px]:order-2" />
				<ContactCard
					t={t}
					lang={lang}
					onOpenModal={onOpenModal}
					className="order-3 min-[900px]:order-3"
				/>
				<TechStackCard
					id="tecnologias"
					t={t}
					lang={lang}
					className="order-4 min-[900px]:order-4"
				/>
				<CertificationsCard
					id="certificaciones"
					t={t}
					lang={lang}
					className="order-8 min-[900px]:order-5"
				/>
				<ProjectsCard
					id="proyectos"
					t={t}
					lang={lang}
					className="order-5 min-[900px]:order-6"
				/>
				<ExperienceCard
					id="experiencia"
					t={t}
					lang={lang}
					className="order-6 min-[900px]:order-7"
				/>
				<EducationCard
					id="educacion"
					t={t}
					lang={lang}
					className="order-7 min-[900px]:order-8"
				/>
			</BentoGrid>
			<aside className="hidden min-[1380px]:block absolute left-[calc(100%+24px)] top-0 h-full w-[160px]">
				<div className="sticky top-28">
					<NavigationIndex t={t} lang={lang} />
				</div>
			</aside>
		</div>
	);
};
