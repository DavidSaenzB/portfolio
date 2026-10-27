"use client"
import Link from "next/link";
import SectionHeading from "@/components/home/section-heading";
import { useLanguage } from "@/context/LanguageContext";

const WhyMeSection = () => {
    const { dict } = useLanguage();
    const copy = dict.home.whyMe;

    return (
        <section id="about" aria-labelledby="about-title" className="grid gap-12 scroll-mt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
                <SectionHeading id="about-title" label={copy.label} title={copy.title} />
                <Link href="/about-me" className="inline-block mt-8 font-semibold transition-colors text-emerald-400 hover:text-emerald-300">
                    {copy.link}
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {copy.points.map((point) => (
                    <div key={point.title} className="p-8 border rounded-3xl border-slate-700/50 bg-slate-900/60">
                        <h3 className="text-lg font-bold text-white">{point.title}</h3>
                        <p className="mt-3 leading-relaxed text-slate-300">{point.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyMeSection;
