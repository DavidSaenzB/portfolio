"use client"
import { serviceData } from "@/data";
import { useLanguage } from "@/context/LanguageContext";

interface ServicesListProps {
    indices?: number[];
}

// Service cards in the landing's card style (same as "Why work with me"), two columns from md.
const ServicesList = ({ indices }: ServicesListProps) => {
    const { dict } = useLanguage();

    const items = dict.services.items
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !indices || indices.includes(index));

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map(({ item, index }) => (
                <div key={index} className="p-8 border rounded-3xl border-slate-700/50 bg-slate-900/60">
                    <div aria-hidden="true" className="text-emerald-400">{serviceData[index].icon}</div>
                    <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-300">{item.description}</p>
                </div>
            ))}
        </div>
    );
}

export default ServicesList;
