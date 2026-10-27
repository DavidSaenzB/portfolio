"use client"
import { dataCounter } from "@/data";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const CounterItem = ({ endCounter, text }: { endCounter: number, text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Count up once, when 40% of the cell is on screen.
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Read in an effect (not during render) so the server HTML and hydration still match.
    if (reduceMotion) {
      setCount(endCounter);
      return;
    }
    if (!inView) return;

    let start = 0;
    const duration = 2000;
    const incrementTime = Math.abs(Math.floor(duration / endCounter));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= endCounter) {
        setCount(endCounter);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [endCounter, inView, reduceMotion]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-4xl font-extrabold md:text-5xl text-emerald-400 tabular-nums">
        {count}+
      </p>
      <p className="text-sm font-medium tracking-wide uppercase text-slate-300">{text}</p>
    </div>
  )
}

const CounterServices = () => {
    const { dict } = useLanguage();

    // divide-* draws the separators: horizontal between stacked cells on mobile, vertical on md+.
    return (
        <div className="grid grid-cols-1 border divide-y md:grid-cols-3 md:divide-y-0 md:divide-x divide-slate-700/50 rounded-3xl border-slate-700/50 bg-slate-900/60">
            {dataCounter.map((data, index) => (
                <CounterItem key={data.id} endCounter={data.endCounter} text={dict.about.counters[index].text} />
            ))}
        </div>
    );
}

export default CounterServices;
