"use client"
import { useLanguage } from "@/context/LanguageContext";

const cardClass = "rounded-3xl border border-slate-700/50 bg-slate-900/60 p-8";

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-lg text-slate-400">{subtitle}</p>}
    </div>
);

// Career sections of the About page: software roles, business background, education.
const TimeLine = () => {
    const { dict } = useLanguage();
    const { software, business, education } = dict.about;

    return (
        <>
            <section>
                <SectionHeading title={software.title} />
                <div className="flex flex-col gap-6">
                    {software.items.map((job) => (
                        <article key={job.company} className={`${cardClass} grid gap-3 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8`}>
                            <p className="font-semibold text-emerald-400">{job.period}</p>
                            <div>
                                <h3 className="text-xl font-bold text-white">{job.role}</h3>
                                <p className="mt-1 text-slate-400">{job.company} · {job.location}</p>
                                <p className="mt-4 leading-relaxed text-slate-300">{job.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeading title={business.title} subtitle={business.subtitle} />
                <div className="grid gap-6 md:grid-cols-2">
                    {business.items.map((job) => (
                        <article key={job.company} className={cardClass}>
                            <p className="font-semibold text-emerald-400">{job.period}</p>
                            <h3 className="mt-3 text-xl font-bold text-white">{job.role}</h3>
                            <p className="mt-1 text-slate-400">{job.company}</p>
                            <p className="mt-4 leading-relaxed text-slate-300">{job.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeading title={education.title} />
                <ul className="border-y divide-y border-slate-700/50 divide-slate-700/50">
                    {education.items.map((item) => (
                        <li key={item.title} className="flex items-start justify-between gap-6 py-6">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                <p className="mt-1 text-slate-400">
                                    {[item.institution, item.detail].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <p className="font-semibold shrink-0 text-emerald-400 tabular-nums">{item.year}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}

export default TimeLine;
