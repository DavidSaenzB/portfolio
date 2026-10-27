"use client"
import Link from "next/link";
import { dataPortfolio } from "@/data";
import FeaturedProject from "@/components/home/featured-project";
import SectionHeading from "@/components/home/section-heading";
import { useLanguage } from "@/context/LanguageContext";

// The first four entries are client/product work; the fifth is this portfolio itself.
const FEATURED_COUNT = 4;

const FeaturedWorkSection = () => {
    const { dict } = useLanguage();
    const copy = dict.home.work;

    return (
        <section id="work" aria-labelledby="work-title" className="scroll-mt-24">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeading id="work-title" label={copy.label} title={copy.title} />
                <Link href="/portfolio" className="font-semibold transition-colors shrink-0 text-emerald-400 hover:text-emerald-300">
                    {copy.link}
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-14 md:grid-cols-2">
                {dataPortfolio.slice(0, FEATURED_COUNT).map((project, index) => (
                    <FeaturedProject
                        key={project.id}
                        image={project.image}
                        title={dict.portfolio.items[index].title}
                        description={dict.portfolio.items[index].description}
                        urlDemo={project.urlDemo}
                        urlGithub={project.urlGithub}
                        btnDemo={dict.portfolio.btnDemo}
                        btnGithub={dict.portfolio.btnGithub}
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedWorkSection;
