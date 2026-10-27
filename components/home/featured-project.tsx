import Image from "next/image";

interface FeaturedProjectProps {
    image: string;
    title: string;
    description: string;
    urlDemo: string;
    urlGithub: string;
    btnDemo: string;
    btnGithub: string;
    // /portfolio shows the whole description; the landing clamps it to three lines.
    fullDescription?: boolean;
}

const linkClass = "inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl text-sm transition-all";

const FeaturedProject = ({ image, title, description, urlDemo, urlGithub, btnDemo, btnGithub, fullDescription = false }: FeaturedProjectProps) => (
    <article className="flex flex-col overflow-hidden border rounded-3xl border-slate-700/50 bg-slate-900/60">
        <div className="relative border-b aspect-video border-slate-700/50">
            {/* Two columns from md (max 560px each inside the 6xl container), one column below. */}
            <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width: 1216px) 560px, (min-width: 768px) calc(50vw - 48px), calc(100vw - 32px)"
                className="object-cover"
            />
        </div>
        <div className="flex flex-col flex-1 p-8">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className={`mt-3 leading-relaxed text-slate-300 ${fullDescription ? "" : "line-clamp-3"}`}>{description}</p>
            <div className="flex flex-wrap gap-3 pt-6 mt-auto">
                {urlDemo !== "#!" && (
                    <a href={urlDemo} target="_blank" rel="noopener noreferrer" className={`${linkClass} font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400`}>
                        {btnDemo}
                    </a>
                )}
                <a href={urlGithub} target="_blank" rel="noopener noreferrer" className={`${linkClass} font-medium border border-slate-600 text-white hover:border-emerald-400 hover:text-emerald-300`}>
                    {btnGithub}
                </a>
            </div>
        </div>
    </article>
);

export default FeaturedProject;
