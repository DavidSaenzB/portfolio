"use client";
import CoverParticles from "@/components/cover-particles";
import TransitionPage from "@/components/transition-page";
import { useLanguage } from "@/context/LanguageContext";
import { privacyContent } from "@/locales/privacy";

const PrivacyContent = () => {
  const { language } = useLanguage();
  const doc = privacyContent[language];

  return (
    <>
      <TransitionPage />
      <CoverParticles />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-40">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{doc.title}</h1>
        <p className="text-sm text-slate-400 mb-10">{doc.lastUpdated}</p>

        {doc.intro.map((para, i) => (
          <p key={i} className="text-slate-300 leading-relaxed mb-4">
            {para}
          </p>
        ))}

        <div className="mt-8 space-y-10">
          {doc.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl md:text-2xl font-bold text-emerald-500 mb-4">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.content.map((block, j) =>
                  Array.isArray(block) ? (
                    <ul key={j} className="list-disc pl-5 space-y-1.5 text-slate-300">
                      {block.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="text-slate-300 leading-relaxed">
                      {block}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-slate-800 pt-6 text-sm italic text-slate-400">
          {doc.disclaimer}
        </p>
      </div>
    </>
  );
};

export default PrivacyContent;
