import CoverParticles from "@/components/cover-particles";
import TransitionPage from "@/components/transition-page";
import ContactSection from "@/components/home/contact-section";

const ContactPage = () => (
    <>
        <TransitionPage />
        <CoverParticles />
        {/* relative z-10: the particles canvas is position:fixed z-0. pt clears the absolute header (56px on
            phones); pb keeps the fixed dock off the form. */}
        <div className="relative z-10 px-4 pt-24 pb-32 md:px-8 md:pt-36">
            <div className="max-w-6xl mx-auto">
                <ContactSection page />
            </div>
        </div>
    </>
);

export default ContactPage;
