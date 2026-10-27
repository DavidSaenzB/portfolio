import TransitionPage from "@/components/transition-page";

import Introduction from "@/components/introduction";
import NeuralParticles from "@/components/NeuralParticles";
import StatsSection from "@/components/home/stats-section";
import PackagesSection from "@/components/home/packages-section";
import FeaturedWorkSection from "@/components/home/featured-work-section";
import WhyMeSection from "@/components/home/why-me-section";
import ContactSection from "@/components/home/contact-section";

export default function Home() {
  return (
    // overflow-x-clip keeps the photo chips from adding horizontal scroll on very narrow screens.
    <main className="overflow-x-clip">
      <TransitionPage />
      <NeuralParticles />
      {/* The hero fills the first screen. pt clears the absolute header (taller on mobile, where it
          stacks); pb clears the fixed dock. On md+ screens shorter than 861px the top padding
          tightens to keep the hero clear of the dock. */}
      <div className="flex flex-col items-center justify-center px-4 pt-40 pb-28 min-h-dvh md:px-8 md:pt-24 md:[@media(min-height:861px)]:pt-28 md:[@media(min-height:861px)]:pb-32">
        <Introduction />
      </div>
      {/* relative z-10 keeps the sections above the fixed particles canvas; pb-32 keeps the dock off
          the last one. */}
      <div className="relative z-10 px-4 pb-32 md:px-8">
        <div className="flex flex-col max-w-6xl gap-24 mx-auto md:gap-40">
          <StatsSection />
          <PackagesSection />
          <FeaturedWorkSection />
          <WhyMeSection />
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
