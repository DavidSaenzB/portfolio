import TransitionPage from "@/components/transition-page";

import Introduction from "@/components/introduction";
import NeuralParticles from "@/components/NeuralParticles";

export default function Home() {
  return (
    // pt clears the absolute header (taller on mobile, where it stacks); pb clears the fixed dock.
    // overflow-x-clip keeps the photo chips from adding horizontal scroll on very narrow screens.
    // On md+ screens shorter than 861px the top padding tightens to keep the hero clear of the dock.
    <main className="flex flex-col items-center justify-center px-4 pt-40 pb-28 overflow-x-clip md:px-8 md:pt-24 md:[@media(min-height:861px)]:pt-28 md:[@media(min-height:861px)]:pb-32">
      <TransitionPage />
      <NeuralParticles />
      <Introduction />
    </main>
  );
}
