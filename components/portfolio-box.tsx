import Link from "next/link";

interface PortfolioBoxProps {
    data: {
        id: number,
        image: string,
        urlGithub: string,
        urlDemo: string
    },
    title: string,
    btnGithub: string,
    btnDemo: string
}

const PortfolioBox = (props: PortfolioBoxProps) => {
    const { data, title, btnGithub, btnDemo } = props

    return (
        <div className="p-4 border border-teal-50/20 rounded-xl bg-slate-800/20 hover:bg-slate-800/50 transition-all duration-300">
            <h3 className="mb-4 text-xl font-bold text-emerald-400 min-h-[56px] flex items-center">{title}</h3>
            <img 
                src={data.image} 
                alt={title} 
                className="w-full h-[180px] object-cover rounded-2xl mb-4 border border-slate-700/50" 
            />

            <div className="flex gap-4 mt-auto">
                <Link 
                    href={data.urlGithub} 
                    target="_blank" 
                    className="flex-1 text-center p-2 text-sm font-semibold transition duration-150 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                >
                    {btnGithub}
                </Link>

                {data.urlDemo !== "#!" && (
                    <Link 
                        href={data.urlDemo} 
                        target="_blank" 
                        className="flex-1 text-center p-2 text-sm font-semibold transition duration-150 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
                    >
                        {btnDemo}
                    </Link>
                )}
            </div>
        </div>
    );
}

export default PortfolioBox;
