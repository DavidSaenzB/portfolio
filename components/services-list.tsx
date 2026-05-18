"use client"
import { serviceData } from "@/data";
import { useLanguage } from "@/context/LanguageContext";

interface ServicesListProps {
    indices?: number[];
    gridClass?: string;
}

const ServicesList = ({ indices, gridClass }: ServicesListProps) => {
    const { dict } = useLanguage();

    const items = dict.services.items
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !indices || indices.includes(index));

    const grid = gridClass ?? "md:grid-cols-2 lg:grid-cols-3";

    return (
        <div className={`grid items-center justify-center max-w-5xl gap-6 mx-auto ${grid}`}>
            {items.map(({ item, index }) => (
                <div key={index} className="rounded-xl border border-teal-50/20 bg-slate-800/20 p-6 shadow-light hover:shadow-emerald-500/20 transition-all duration-300">
                    <div className="mb-4 text-4xl text-emerald-500">{serviceData[index].icon}</div>
                    <div>
                        <h3 className="mb-4 text-lg font-bold">{item.title}</h3>
                        <p className="text-slate-300">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ServicesList;
