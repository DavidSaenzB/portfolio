"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { socialNetworks } from "@/data";
import MotionTransition from "./transition-component";
import { useLanguage } from "@/context/LanguageContext";
import { handleHomeLinkClick } from "@/utils/home-link";

// Text links to the Home sections (md+ only; on phones the dock covers navigation).
const sectionLinks = [
  { key: "services", href: "/#services" },
  { key: "work", href: "/#work" },
  { key: "about", href: "/#about" },
] as const;

const Header = () => {
  const { language, setLanguage, dict } = useLanguage();
  const pathname = usePathname();

  return (
    <MotionTransition
      position="bottom"
      className="absolute z-40 w-full top-0 left-0"
    >
      <header className="backdrop-blur-md shadow-md">
        {/* One row everywhere. Phones get a compact bar (56px): logo, email and language only. 768-1023px is
            too narrow for the full-size row (~900px in ES), so md keeps the logo small and tightens links and
            gaps; lg restores the original sizes. */}
        <div className="container mx-auto max-w-6xl px-4
                        flex items-center justify-between gap-3 md:gap-4 lg:gap-6">

          {/* Logo / Nombre */}
          <Link href="/" onClick={(event) => handleHomeLinkClick(event, pathname)} className="block shrink-0">
            {/* text-xl below 375px keeps logo + email + language on one row at 320px. */}
            <h1 className="my-3 text-2xl max-[375px]:text-xl lg:text-4xl font-bold text-left text-white flex items-center justify-start gap-2">
              David Saenz <span className="text-emerald-400">Dev</span>
            </h1>
          </Link>

          <nav aria-label={dict.nav.main} className="hidden md:flex items-center gap-4 lg:gap-6">
            {sectionLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="font-semibold whitespace-nowrap md:text-sm lg:text-base text-slate-300 transition-colors hover:text-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
              >
                {dict.nav[item.key]}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="md:px-4 lg:px-5 py-2 md:text-sm lg:text-base font-semibold whitespace-nowrap transition-colors rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              {dict.nav.talk}
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3 lg:gap-5">
            {/* Redes sociales */}
            <nav aria-label={dict.nav.social} className="flex items-center justify-center gap-5 md:gap-0 lg:gap-5">
              {socialNetworks.map((item) => {
                // mailto opens the mail client; a new tab would just be left blank. Phones keep only the email.
                const external = !item.src.startsWith("mailto:");

                return (
                  <Link
                    key={item.id}
                    href={item.src}
                    aria-label={item.label}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={`${external ? "hidden md:flex" : "flex"} items-center justify-center w-10 h-10
                              text-white hover:text-emerald-400
                              transition-colors duration-300 ease-in-out
                              hover:scale-110`}
                  >
                    {item.logo}
                  </Link>
                );
              })}
            </nav>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="lg:ml-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:border-emerald-500 transition-all shadow-md"
            >
              {language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
          </div>
        </div>
      </header>
    </MotionTransition>
  );
};

export default Header;
