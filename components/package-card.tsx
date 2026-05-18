interface PackageCardProps {
    name: string;
    subtitle: string;
    price: string;
    delivery: string;
    features: string[];
    btn: string;
    href: string;
    external: boolean;
    deliveryLabel: string;
    popular?: boolean;
    popularBadge?: string;
    launchBadge?: string;
}

export default function PackageCard({
    name, subtitle, price, delivery, features, btn, href, external,
    deliveryLabel, popular, popularBadge, launchBadge,
}: PackageCardProps) {
    return (
        <div className={`relative rounded-xl border p-6 flex flex-col transition-all duration-300 ${
            popular
                ? "border-emerald-500 bg-slate-800/40 shadow-lg shadow-emerald-500/10"
                : "border-teal-50/20 bg-slate-800/20 hover:shadow-emerald-500/20 hover:shadow-md"
        }`}>
            {popular && popularBadge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {popularBadge}
                </span>
            )}
            {launchBadge && (
                <span className="absolute -top-3.5 left-5 border border-emerald-500 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap bg-slate-900">
                    {launchBadge}
                </span>
            )}

            <h3 className="text-xl font-bold mb-2 mt-2">{name}</h3>
            <p className="text-sm text-slate-400 mb-5">{subtitle}</p>
            <p className="text-3xl font-bold text-emerald-500 mb-1">{price}</p>
            <p className="text-sm text-slate-400 mb-6">
                {deliveryLabel}: <span className="text-white">{delivery}</span>
            </p>

            <ul className="text-slate-300 text-sm space-y-2 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`w-full text-center py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    popular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                        : "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/20"
                }`}
            >
                {btn}
            </a>
        </div>
    );
}
