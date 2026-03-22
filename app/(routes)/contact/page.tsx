"use client"
import CoverParticles from "@/components/cover-particles";
import TransitionPage from "@/components/transition-page";
import ContactForm from "@/components/contact-form";
import { useLanguage } from "@/context/LanguageContext";

const ContactPage = () => {
    const { dict } = useLanguage();

    return (
        <>
            <TransitionPage />
            <CoverParticles />
            <div className="flex flex-col min-h-screen pt-36 px-4 pb-32 md:px-0 bg-no-repeat bg-gradient-cover relative z-10 mt-10">
                <div className="container max-w-6xl mx-auto">
                    <h1 className="text-3xl leading-tight text-center md:text-left md:text-5xl md:mb-12 mb-8 font-bold relative z-20">
                        {dict.contact.title1} <span className="text-emerald-500">{dict.contact.title2}</span>
                    </h1>

                    <div className="flex flex-col lg:flex-row gap-12 relative z-20">
                        <div className="flex-1">
                            <h3 className="text-2xl mb-4 font-semibold text-slate-100">{dict.contact.subtitle}</h3>
                            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                {dict.contact.text1}
                            </p>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                {dict.contact.text2}
                            </p>
                        </div>
                        <div className="flex-1">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;
