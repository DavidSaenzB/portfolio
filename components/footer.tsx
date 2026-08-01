"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { dict } = useLanguage();

  return (
    // pb-28 deja espacio para el navbar flotante (fixed bottom-8) y evita solaparse.
    <footer className="relative z-10 mt-20 border-t border-slate-800 pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row">
        <span>© 2026 David Sáenz. {dict.footer.rights}</span>
        <Link href="/privacidad" className="transition-colors hover:text-emerald-400">
          {dict.footer.privacy}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
