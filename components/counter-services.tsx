"use client"
import { dataCounter } from "@/data";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const CounterItem = ({ endCounter, text }: { endCounter: number, text: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [endCounter]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
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
