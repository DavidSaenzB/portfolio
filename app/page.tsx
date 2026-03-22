import TransitionPage from "@/components/transition-page";

import Introduction from "@/components/introduction";
import NeuralParticles from "@/components/NeuralParticles";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 pt-32 pb-24 md:p-24">
      <TransitionPage />
      <div className="flex flex-col items-center justify-center w-full h-full bg-no-repeat bg-gradient-cover">
        <NeuralParticles />
        <Introduction />
        

       
      </div>
    </main>
  );
}
