"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const NeuralParticles = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  return (
    init && (
      <Particles
        id="tsparticles"
        options={{
          background: { color: "#0f172a" }, // slate-900
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
            },
            modes: {
              grab: { distance: 180, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: "#38bdf8" }, // cyan-400
            links: {
              color: "#38bdf8",
              distance: 200,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
              outModes: { default: "out" },
            },
            number: { value: 60, density: { enable: true } },
            opacity: { value: 0.6 },
            shape: { type: "circle" },
            size: { value: { min: 2, max: 4 } },
          },
        }}
      />
    )
  );
};

export default NeuralParticles;
