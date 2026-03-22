"use client"
import TransitionPage from "@/components/transition-page";
import TimeLine from "@/components/time-line";
import CounterServices from "@/components/counter-services";
import CoverParticles from "@/components/cover-particles";
import { useLanguage } from "@/context/LanguageContext";

const PageAboutMe = () => {
    const { dict } = useLanguage();
    
    return (
        <>
            <TransitionPage />
            <CoverParticles />
            <div className="flex flex-col min-h-screen pt-36 pb-32 px-4 md:px-0 bg-no-repeat bg-gradient-cover relative z-10 mt-10">
                <div className="container max-w-6xl mx-auto">
                    <h1 className="text-2xl leading-tight text-center md:text-left md:text-5xl md:mt-10 mb-10 md:mb-20">
                        {dict.about.title1}
                        <span className="font-bold text-emerald-500">
                            {dict.about.title2}
                        </span>
                    </h1>
                    <CounterServices />
                    <TimeLine />
                </div>
            </div>
        </>
    );
};

export default PageAboutMe;