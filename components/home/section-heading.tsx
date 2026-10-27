interface SectionHeadingProps {
    id: string;
    label: string;
    title: string;
    subtitle?: string;
}

// Label + title (+ optional subtitle) shared by the landing sections; `id` feeds aria-labelledby.
const SectionHeading = ({ id, label, title, subtitle }: SectionHeadingProps) => (
    <div>
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-emerald-400">{label}</p>
        <h2 id={id} className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{title}</h2>
        {subtitle && <p className="max-w-2xl mt-5 text-lg leading-relaxed text-slate-300">{subtitle}</p>}
    </div>
);

export default SectionHeading;
