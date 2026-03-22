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
    <div className="flex flex-col items-center justify-center">
      <p className="flex mb-2 text-2xl font-extrabold md:text-4xl text-emerald-500">
        + {count}
      </p>
      <p className="text-sm uppercase max-w-[100px] text-center">{text}</p>
    </div>
  )
}

const CounterServices = () => {
    const { dict } = useLanguage();

    return (
        <div className="grid justify-between max-w-3xl grid-cols-1 gap-3 mx-auto my-8 md:grid-cols-3 md:gap-6">
            {dataCounter.map((data, index) => (
                <div key={data.id} className={`${data.lineRight ? 'md:border-r border-gray-100/20' : ''} ${data.lineRightMobile ? 'border-b md:border-b-0 border-gray-100/20 pb-4 md:pb-0' : ''} flex flex-col items-center justify-center p-2`}>
                    <CounterItem endCounter={data.endCounter} text={dict.about.counters[index].text} />
                </div>
            ))}
        </div>
    );
}

export default CounterServices;
