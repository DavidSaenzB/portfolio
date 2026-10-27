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
            {/* relative z-10: the particles canvas is position:fixed z-0. pt clears the absolute header
                (taller on mobile, where it stacks); pb keeps the fixed dock off the last section. */}
            <div className="relative z-10 px-4 pt-40 pb-32 md:px-8 md:pt-36">
                <div className="flex flex-col max-w-5xl gap-24 mx-auto">
                    <section>
                        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-emerald-400">
                            {dict.about.label}
                        </p>
                        <h1 className="mt-5 text-4xl leading-[1.05] tracking-tight md:text-6xl">
                            <span className="block font-medium text-white">{dict.about.title1}</span>
                            <span className="block font-extrabold text-emerald-400">{dict.about.title2}</span>
                        </h1>
                        <p className="max-w-2xl mt-8 text-lg leading-relaxed md:text-xl text-slate-300">
                            {dict.about.intro}
                        </p>
                        <div className="mt-14">
                            <CounterServices />
                        </div>
                    </section>
                    <TimeLine />
                </div>
            </div>
        </>
    );
};

export default PageAboutMe;
