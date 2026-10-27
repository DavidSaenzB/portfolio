"use client"
import Link from "next/link";
import CoverParticles from "@/components/cover-particles";
import ServicesList from "@/components/services-list";
import TransitionPage from "@/components/transition-page";
import PackageCard from "@/components/package-card";
import PageHeading from "@/components/page-heading";
import SectionHeading from "@/components/home/section-heading";
import { useLanguage } from "@/context/LanguageContext";

// Typed as string: as a literal, filling it in would make `WHATSAPP_NUMBER !== ""` a type error (no overlap).
const WHATSAPP_NUMBER: string = ""; // 57XXXXXXXXXX — fill in when ready

function waLink(msg: string): string {
    if (!WHATSAPP_NUMBER) return "/contact";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const ctaClass = "inline-flex items-center justify-center w-full md:w-auto min-h-[52px] px-7 font-bold whitespace-nowrap transition-all rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

const ServicesPage = () => {
    const { dict } = useLanguage();
    const { packages, cta, custom } = dict.services;
    const home = dict.home.packages;
    const hasWhatsApp = WHATSAPP_NUMBER !== "";
    // Without a number every button falls back to /contact, so the CTA copy can't promise WhatsApp.
    const ctaCopy = hasWhatsApp ? cta.whatsapp : cta.contact;
    const ctaHref = waLink(cta.waMsg);

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            {/* relative z-10: the particles canvas is position:fixed z-0. pt clears the absolute header
                (56px on phones); pb keeps the fixed dock off the last section. */}
            <div className="relative z-10 px-4 pt-24 pb-32 md:px-8 md:pt-36">
                <div className="flex flex-col max-w-6xl gap-24 mx-auto">
                    <PageHeading label={dict.services.label} title1={dict.services.title1} title2={dict.services.title2} intro={dict.services.description} />

                    {/* Same cards and badges as the landing; the grid stretches them to one height per row. */}
                    <section aria-labelledby="packages-title">
                        <SectionHeading id="packages-title" label={home.label} title={home.title} subtitle={home.subtitle} />
                        <div className="grid grid-cols-1 gap-8 mt-14 lg:grid-cols-3">
                            {packages.items.map((pkg, i) => (
                                <PackageCard
                                    key={pkg.name}
                                    variant="home"
                                    name={pkg.name}
                                    subtitle={pkg.subtitle}
                                    price={pkg.price}
                                    delivery={pkg.delivery}
                                    features={pkg.features}
                                    btn={pkg.btn}
                                    href={waLink(pkg.waMsg)}
                                    external={hasWhatsApp}
                                    deliveryLabel={packages.deliveryLabel}
                                    popular={i === 1}
                                    popularBadge={i === 1 ? packages.popularBadge : undefined}
                                    launchBadge={i === 0 ? packages.launchBadge : undefined}
                                />
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="custom-title">
                        <SectionHeading id="custom-title" label={custom.label} title={custom.title} />
                        <div className="mt-14">
                            <ServicesList indices={[1, 3, 4, 5]} />
                        </div>
                    </section>

                    {/* Closing CTA in the landing's contact-card style; the button keeps its waLink target. */}
                    <section aria-labelledby="cta-title" className="flex flex-col gap-8 p-8 border sm:p-10 lg:p-14 md:flex-row md:items-center md:justify-between rounded-[32px] border-emerald-500/20 bg-emerald-950/40">
                        <h2 id="cta-title" className="max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl">{ctaCopy.text}</h2>
                        {hasWhatsApp ? (
                            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={ctaClass}>{ctaCopy.btn}</a>
                        ) : (
                            <Link href={ctaHref} className={ctaClass}>{ctaCopy.btn}</Link>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
};

export default ServicesPage;
