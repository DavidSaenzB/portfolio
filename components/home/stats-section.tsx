"use client"
import CounterServices from "@/components/counter-services";
import { useLanguage } from "@/context/LanguageContext";

const StatsSection = () => {
    const { dict } = useLanguage();

    return (
        <section aria-label={dict.home.stats.ariaLabel}>
            <CounterServices />
        </section>
    );
};

export default StatsSection;
