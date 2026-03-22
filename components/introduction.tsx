"use client"
import React from 'react'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const Introduction = () => {
  const { dict, language } = useLanguage();

  return (
    <div className="z-20 w-full bg-darkBg/60">
      <div className="z-20 grid items-center h-full p-6 py-20 md:py-0 md:grid-cols-2">
        <Image 
          src="/home-4.png" 
          priority 
          width={800} 
          height={800} 
          alt="Profile pic" 
          className="w-[200px] md:w-[400px] h-auto mx-auto mb-8 md:mb-0"
        />

        <div className="flex flex-col justify-center max-w-md mx-auto md:mx-0">
          <h1 className="mb-5 text-2xl leading-tight text-center md:text-left md:text-4xl md:mb-10">
            {dict.intro.line1} <br />  
          <TypeAnimation
            key={language}
            sequence={[
              dict.intro.typeItems[0], 2000,
              dict.intro.typeItems[1], 2000,
              dict.intro.typeItems[2], 2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="font-bold text-emerald-500 text-2xl md:text-4xl text-center md:text-left"
            />
            </h1>

            <p className="mx-auto mb-2 text-xl md:mx-0 md:mb-8 text-center md:text-left text-slate-300">
               {dict.intro.bio}
            </p>
            <div className="flex item-center justify-center gap-3 md:justify-start md:gap-10">
              <Link href="/portfolio" className='px-3 py-2 transition-all border-2 cursor-pointer text-md w-fit rounded-xl hover:shadow-xl hover:shadow-white/50 border-emerald-500 hover:bg-emerald-500/20'>
                  {dict.intro.btnProjects}
              </Link>
              <Link href="/contact" className='px-3 py-2 transition-all border-2 cursor-pointer text-emerald-500 border-emerald-500 text-md w-fit rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 border-emerald-500 hover:bg-emerald-500/20'>
                  {dict.intro.btnContact}
              </Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Introduction
