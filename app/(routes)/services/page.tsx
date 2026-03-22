"use client"
import CoverParticles from "@/components/cover-particles";
import ServicesList from "@/components/services-list";
import TransitionPage from "@/components/transition-page";
import { useLanguage } from "@/context/LanguageContext";

const ServicesPage = () => {
    const { dict } = useLanguage();

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            <div className="grid items-center justify-center min-h-screen max-w-5xl gap-6 mx-auto md:grid-cols-2 relative z-10 px-4 mt-20">
                <div className="max-w-[450px]">
                    <h1 className="text-3xl leading-tight text-center md:text-left md:text-5xl md:mb-6 mb-6">
                        {dict.services.title1} <span className="font-bold text-emerald-500">{dict.services.title2}</span>
                    </h1>
                    <p className="max-w-3xl mb-12 text-lg text-slate-300 text-center md:text-left">
                        {dict.services.description}
                    </p>
                </div>
                <div>
                   <ServicesList />
                </div>
            </div>
        </>
    );
}

export default ServicesPage;
