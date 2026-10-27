"use client"
import React from 'react'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const Introduction = () => {
  const { dict, language } = useLanguage();
  const bioParagraphs = dict.intro.bio.split("\n\n");

  return (
    // relative z-10: the tsParticles canvas is position:fixed z-0 and would paint over static content.
    // Spacing uses the compact scale by default and opens up only on md+ screens at least 861px tall,
    // so short laptops (1366x768, 1280x800, iPad landscape) keep the whole hero clear of the dock.
    <section className="relative z-10 w-full">
      <div className="grid items-center grid-cols-1 max-w-6xl gap-16 mx-auto md:grid-cols-[minmax(0,1fr)_auto] md:gap-20">
        <div className="@container flex flex-col items-center text-center md:items-start md:text-left">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-sm font-semibold border rounded-full border-emerald-500/30 bg-emerald-950/40 text-emerald-300 md:[@media(min-height:861px)]:mb-6">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-400" />
            {dict.intro.availability}
          </span>

          {/* Font scales with the column (cqi) so the longest typed phrase (~9em) always fits on one
              line: 36px on a 375px phone, capped at 72px (text-7xl) on wide columns and at 36px on
              landscape phones. */}
          <h1 className="mb-6 text-[length:clamp(1.75rem,10.5cqi,4.5rem)] leading-[1.05] tracking-tight md:[@media(min-height:861px)]:mb-8 [@media(max-height:500px)]:text-[length:clamp(1.75rem,10.5cqi,2.25rem)]">
            <span className="block font-medium text-white">{dict.intro.line1}</span>
            {/* min-h + nowrap reserve the animated line so nothing below jumps between words */}
            <TypeAnimation
              key={language}
              sequence={dict.intro.typeItems.flatMap((item) => [item, 2000])}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="block min-h-[1.05em] font-extrabold text-emerald-400 whitespace-nowrap"
            />
          </h1>

          <div className="flex flex-col max-w-xl gap-4 mb-8 text-lg leading-relaxed text-slate-300 md:[@media(max-height:860px)]:leading-normal md:[@media(min-height:861px)]:gap-5 md:[@media(min-height:861px)]:mb-10 xl:[@media(min-height:950px)]:text-xl">
            {bioParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Below lg each button takes half the row and grows to 100% when the pair doesn't fit. */}
          <div className="flex flex-wrap w-full max-w-md gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center grow basis-[calc(50%_-_0.5rem)] min-h-[52px] px-7 font-bold whitespace-nowrap transition-all rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:grow-0 lg:basis-auto"
            >
              {dict.intro.btnProjects}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center grow basis-[calc(50%_-_0.5rem)] min-h-[52px] px-7 font-semibold text-white whitespace-nowrap transition-all border rounded-2xl border-slate-600 hover:border-emerald-400 hover:bg-white/5 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:grow-0 lg:basis-auto"
            >
              {dict.intro.btnContact}
            </Link>
          </div>
        </div>

        {/* Width is capped by the small viewport height so the framed photo always fits above the dock
            (landscape phones); max-w keeps room for the chips on 320-360px screens. */}
        <div className="@container relative w-[min(300px,calc((100svh_-_132px)_*_0.8))] max-w-[calc(100%_-_2rem)] mx-auto md:mx-0 md:max-w-none md:justify-self-end lg:w-[min(380px,calc((100svh_-_132px)_*_0.8))]">
          <div aria-hidden="true" className="absolute pointer-events-none -inset-3.5 rounded-[40px] border border-emerald-500/20" />
          <div className="relative overflow-hidden border aspect-[4/5] rounded-[32px] border-slate-700/60">
            {/* The square source covers a 4:5 frame, so it is drawn at the frame's height (1.25x its width). */}
            <Image
              src="/images/david-saenz.png"
              priority
              width={800}
              height={800}
              sizes="(min-width: 1024px) 475px, 375px"
              alt="David Saenz"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Chips sit below (bottom-left) and right of (top-right) the face; compact on small photos. */}
          <div className="absolute max-w-[11rem] px-4 py-3 border -left-6 bottom-[6%] md:-left-9 rounded-2xl border-slate-700/60 bg-slate-900/90 @max-[15rem]:px-3 @max-[15rem]:py-2">
            <p className="text-3xl font-extrabold leading-none text-emerald-400 @max-[15rem]:text-2xl">10+</p>
            <p className="mt-1 text-xs leading-snug text-slate-300 @max-[15rem]:text-[10px]">{dict.intro.chipYears}</p>
          </div>
          <div className="absolute w-min px-4 py-3 border -right-6 top-10 rounded-2xl border-slate-700/60 bg-slate-900/90 @max-[15rem]:px-3 @max-[15rem]:py-2">
            <p className="text-3xl font-extrabold leading-none text-emerald-400 @max-[15rem]:text-2xl">63+</p>
            <p className="mt-1 text-xs leading-snug text-slate-300 @max-[15rem]:text-[10px]">{dict.intro.chipProjects}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Introduction
