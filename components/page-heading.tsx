interface PageHeadingProps {
    label: string;
    title1: string;
    title2: string;
    intro: string;
}

// Page intro shared by /services and /portfolio, same type scale as the About header: label, a two-line
// title (second line in emerald) and an intro paragraph.
const PageHeading = ({ label, title1, title2, intro }: PageHeadingProps) => (
    <section>
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-emerald-400">{label}</p>
        <h1 className="mt-5 text-4xl leading-[1.05] tracking-tight md:text-6xl">
            <span className="block font-medium text-white">{title1}</span>
            <span className="block font-extrabold text-emerald-400">{title2}</span>
        </h1>
        <p className="max-w-2xl mt-8 text-lg leading-relaxed md:text-xl text-slate-300">{intro}</p>
    </section>
);

export default PageHeading;
