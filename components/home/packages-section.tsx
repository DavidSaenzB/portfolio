"use client"
import Link from "next/link";
import PackageCard from "@/components/package-card";
import SectionHeading from "@/components/home/section-heading";
import { useLanguage } from "@/context/LanguageContext";

const PackagesSection = () => {
    const { dict } = useLanguage();
    const { packages } = dict.services;
    const copy = dict.home.packages;

    return (
        <section id="services" aria-labelledby="services-title" className="scroll-mt-24">
            <SectionHeading id="services-title" label={copy.label} title={copy.title} subtitle={copy.subtitle} />

            {/* Same badges as /services: launch price on the first package, most popular on the second. */}
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
                        href="#contact"
                        external={false}
                        deliveryLabel={packages.deliveryLabel}
                        popular={i === 1}
                        popularBadge={i === 1 ? packages.popularBadge : undefined}
                        launchBadge={i === 0 ? packages.launchBadge : undefined}
                    />
                ))}
            </div>

            <Link href="/services" className="inline-block mt-10 font-semibold transition-colors text-emerald-400 hover:text-emerald-300">
                {copy.link}
            </Link>
        </section>
    );
};

export default PackagesSection;
