"use client"
import Link from "next/link";
import { socialNetworks } from "@/data";
import MotionTransition from "./transition-component";
import { useLanguage } from "@/context/LanguageContext";

const Header = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <MotionTransition
      position="bottom"
      className="absolute z-40 w-full top-0 left-0"
    >
      <header className="bg-darkbg/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto max-w-6xl px-4
                        flex flex-col items-center gap-4
                        md:flex-row md:justify-between md:items-center">
          
          {/* Logo / Nombre */}
          <Link href="/" className="block w-full md:w-auto">
            <h1 className="my-3 text-3xl md:text-4xl font-bold text-center md:text-left text-white flex items-center justify-center md:justify-start gap-2">
              David Saenz <span className="text-emerald-400">Dev</span>
            </h1>
          </Link>

          <div className="flex items-center gap-5">
            {/* Redes sociales */}
            <nav aria-label="Redes sociales" className="flex items-center justify-center gap-5">
              {socialNetworks.map((item) => (
                <Link
                  key={item.id}
                  href={item.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10
                            text-white hover:text-emerald-400 
                            transition-colors duration-300 ease-in-out
                            hover:scale-110"
                >
                  {item.logo}
                </Link>
              ))}
            </nav>

            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="ml-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:border-emerald-500 transition-all shadow-md"
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


