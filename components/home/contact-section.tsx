"use client"
import ContactForm from "@/components/contact-form";
import { socialNetworks } from "@/data";
import { useLanguage } from "@/context/LanguageContext";

// Reuse the mailto link from the header's social links instead of duplicating the address.
const emailHref = socialNetworks.find((item) => item.src.startsWith("mailto:"))?.src;

const ContactSection = () => {
    const { dict } = useLanguage();

    return (
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24">
            {/* Small padding on phones: ContactForm brings its own p-8 card. grid-cols-1 (minmax(0,1fr))
                keeps the form's longest <option> from widening the column past the screen. */}
            <div className="grid grid-cols-1 gap-10 p-4 border sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14 rounded-[32px] border-emerald-500/20 bg-emerald-950/40">
                <div className="sm:pt-2">
                    <h2 id="contact-title" className="text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
                        <span className="block text-white">{dict.contact.title1.trim()}</span>
                        <span className="block text-emerald-400">{dict.contact.title2}</span>
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-slate-300">{dict.home.contact.text}</p>
                    {emailHref && (
                        <a href={emailHref} className="inline-block mt-6 text-lg font-semibold break-all transition-colors text-emerald-400 hover:text-emerald-300">
                            {emailHref.replace("mailto:", "")}
                        </a>
                    )}
                </div>
                <ContactForm />
            </div>
        </section>
    );
};

export default ContactSection;
