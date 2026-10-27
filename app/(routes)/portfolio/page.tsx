"use client"
import CoverParticles from "@/components/cover-particles";
import TransitionPage from "@/components/transition-page";
import FeaturedProject from "@/components/home/featured-project";
import PageHeading from "@/components/page-heading";
import { dataPortfolio } from "@/data";
import { useLanguage } from "@/context/LanguageContext";

const PortfolioPage = () => {
    const { dict } = useLanguage();
    const copy = dict.portfolio;

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            {/* relative z-10: the particles canvas is position:fixed z-0. pt clears the absolute header
                (56px on phones); pb keeps the fixed dock off the last card. */}
            <div className="relative z-10 px-4 pt-24 pb-32 md:px-8 md:pt-36">
                <div className="flex flex-col max-w-6xl gap-24 mx-auto">
                    <PageHeading label={copy.label} title1={copy.title1} title2={copy.title2} intro={copy.intro} />

                    {/* Same cards as the landing (6xl container, so their image sizes hint still holds), with the
                        full description. */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {dataPortfolio.map((project, index) => (
                            <FeaturedProject
                                key={project.id}
                                image={project.image}
                                title={copy.items[index].title}
                                description={copy.items[index].description}
                                urlDemo={project.urlDemo}
                                urlGithub={project.urlGithub}
                                btnDemo={copy.btnDemo}
                                btnGithub={copy.btnGithub}
                                fullDescription
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortfolioPage;
