"use client"
import CoverParticles from "@/components/cover-particles";
import ServicesList from "@/components/services-list";
import TransitionPage from "@/components/transition-page";
import PackageCard from "@/components/package-card";
import { useLanguage } from "@/context/LanguageContext";

const WHATSAPP_NUMBER = ""; // 57XXXXXXXXXX — fill in when ready

function waLink(msg: string): string {
    if (!WHATSAPP_NUMBER) return "/contact";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const ServicesPage = () => {
    const { dict } = useLanguage();
    const { packages } = dict.services;
    const isExternal = WHATSAPP_NUMBER !== "";

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-20">

                {/* 1. Header — full width */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl leading-tight mb-6">
                        {dict.services.title1}
                        <span className="font-bold text-emerald-500">{dict.services.title2}</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg text-slate-300">
                        {dict.services.description}
                    </p>
                </div>

                {/* 2. Packages */}
                <div className="mb-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        {dict.services.packagesTitle}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {packages.items.map((pkg, i) => (
                            <PackageCard
                                key={i}
                                name={pkg.name}
                                subtitle={pkg.subtitle}
                                price={pkg.price}
                                delivery={pkg.delivery}
                                features={pkg.features}
                                btn={pkg.btn}
                                href={waLink(pkg.waMsg)}
                                external={isExternal}
                                deliveryLabel={packages.deliveryLabel}
                                popular={i === 1}
                                popularBadge={i === 1 ? packages.popularBadge : undefined}
                                launchBadge={i === 0 ? packages.launchBadge : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. Custom capabilities — 4 items in 2×2 grid */}
                <div className="mb-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                        {dict.services.customTitle}
                    </h2>
                    <ServicesList indices={[1, 3, 4, 5]} gridClass="md:grid-cols-2" />
                </div>

                {/* 4. WhatsApp CTA */}
                <div className="text-center rounded-xl border border-teal-50/20 bg-slate-800/20 p-10">
                    <p className="text-xl text-slate-300 mb-6">{dict.services.cta.text}</p>
                    <a
                        href={waLink(dict.services.cta.waMsg)}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 inline-block"
                    >
                        {dict.services.cta.btn}
                    </a>
                </div>

            </div>
        </>
    );
};

export default ServicesPage;
