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
    // Phones: compact cell, number on top so the three line up whatever the label's line count. The label
    // drops the tracking; below 360px "CERTIFICACIONES" no longer fits a third of the row, so it hyphenates
    // (in the page language).
    <div ref={ref} className="flex flex-col items-center justify-start gap-1 px-1.5 py-5 text-center md:justify-center md:gap-2 md:p-8">
      <p className="text-3xl font-extrabold md:text-5xl text-emerald-400 tabular-nums">
        {count}+
      </p>
      <p className="text-xs font-medium uppercase max-[360px]:hyphens-auto md:text-sm md:tracking-wide text-slate-300">{text}</p>
    </div>
  )
}

const CounterServices = () => {
    const { dict, language } = useLanguage();

    // One row of three at every size; divide-x draws the vertical separators. lang drives hyphenation.
    return (
        <div lang={language} className="grid grid-cols-3 border divide-x divide-slate-700/50 rounded-3xl border-slate-700/50 bg-slate-900/60">
            {dataCounter.map((data, index) => (
                <CounterItem key={data.id} endCounter={data.endCounter} text={dict.about.counters[index].text} />
            ))}
        </div>
    );
}

export default CounterServices;
