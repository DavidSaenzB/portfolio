'use client';

import { itemsNavbar } from '@/data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import MotionTransition from './transition-component';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <MotionTransition
      position="right"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
    >
      <nav>
        <div className="flex gap-4">
          {itemsNavbar.map((item) => {
            const isActive = pathname === item.link;

            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-md
                  ${isActive
                    ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/50'
                    : 'bg-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-400'}
                `}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </nav>
    </MotionTransition>
  );
};

export default Navbar;
