"use client"
import CoverParticles from "@/components/cover-particles";
import TransitionPage from "@/components/transition-page";
import PortfolioBox from "@/components/portfolio-box";
import { dataPortfolio } from "@/data";
import { useLanguage } from "@/context/LanguageContext";

const PortfolioPage = () => {
    const { dict } = useLanguage();

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            <div className="flex flex-col min-h-screen pt-36 px-4 pb-32 md:px-0 bg-no-repeat bg-gradient-cover relative z-10 mt-10">
                <div className="container max-w-6xl mx-auto">
                    <h1 className="text-3xl leading-tight text-center md:text-left md:text-5xl md:mb-10 mb-6 font-bold">
                        {dict.portfolio.title1} <span className="text-emerald-500">{dict.portfolio.title2}</span>
                    </h1>

                    <div className="grid gap-6 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl">
                        {dataPortfolio.map((data, index) => (
                            <PortfolioBox
                                key={data.id}
                                data={data}
                                title={dict.portfolio.items[index].title}
                                description={dict.portfolio.items[index].description}
                                btnGithub={dict.portfolio.btnGithub}
                                btnDemo={dict.portfolio.btnDemo}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortfolioPage;
