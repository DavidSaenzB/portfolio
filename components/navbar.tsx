'use client';

import { itemsNavbar } from '@/data';
import { useLanguage } from '@/context/LanguageContext';
import { handleHomeLinkClick } from '@/utils/home-link';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MotionTransition from './transition-component';

type NavKey = (typeof itemsNavbar)[number]['key'];

// Home sections tracked by the scroll spy; their ids match the item keys.
const SECTION_KEYS = itemsNavbar.map((item) => item.key).filter((key) => key !== 'home');

// A section becomes active once its top crosses this fraction of the viewport height. It sits well below
// the sections' scroll-mt-24, so the section a link jumps to is always the one marked.
const ACTIVATION_LINE = 0.4;

// Scroll spy for the Home page: the active item is the lowest section whose top has crossed the activation
// line, or "home" while the hero is what the reader is looking at.
const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState<NavKey>('home');

  useEffect(() => {
    if (!enabled) return;

    // Page order, so the last section that reached the line is the one lowest on the page.
    const sections = SECTION_KEYS.flatMap((key) => {
      const element = document.getElementById(key);
      return element ? [{ key, element }] : [];
    }).sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const footer = document.querySelector('footer');
    let footerVisible = false;

    // Observers only signal that something crossed a boundary; the state is read from the layout, so
    // jumps that skip a whole section can't leave it stale. The comparison matches the observer's own
    // (edge-inclusive, no tolerance): a callback landing exactly on the line must agree with it, or no
    // later transition would correct the result.
    const update = () => {
      const line = window.innerHeight * ACTIVATION_LINE;
      // Once the footer shows, the last section is entirely on screen but may be too short to reach the line.
      const current = footerVisible
        ? sections.at(-1)
        : sections.findLast(({ element }) => element.getBoundingClientRect().top <= line);
      setActive(current?.key ?? 'home');
    };

    // Root = the top part of the viewport down to the activation line: a section's top entering or leaving
    // it is exactly the moment the active item can change.
    const lineObserver = new IntersectionObserver(update, {
      rootMargin: `0px 0px -${(1 - ACTIVATION_LINE) * 100}% 0px`,
    });
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      update();
    });
    sections.forEach(({ element }) => lineObserver.observe(element));
    if (footer) footerObserver.observe(footer);
    // An instant jump between two gaps crosses no observer boundary at all; re-check when scrolling stops.
    window.addEventListener('scrollend', update);

    return () => {
      lineObserver.disconnect();
      footerObserver.disconnect();
      window.removeEventListener('scrollend', update);
    };
  }, [enabled]);

  return active;
};

const Navbar = () => {
  const pathname = usePathname();
  const { dict } = useLanguage();
  const isHome = pathname === '/';
  const activeSection = useActiveSection(isHome);

  // html { scroll-behavior: smooth } also animates the browser's scroll restoration on Back/Forward: a long
  // glide that throws off any navigation started during it. Restore instantly, as before smooth scrolling.
  useEffect(() => {
    const html = document.documentElement;
    const onPopState = () => {
      html.style.scrollBehavior = 'auto';
      setTimeout(() => { html.style.scrollBehavior = ''; }, 100);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <MotionTransition
      position="right"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
    >
      <nav aria-label={dict.nav.dock}>
        {/* Below 360px the five 56px buttons (344px) overflow; 48px buttons and a tighter gap fit in 272px. */}
        <div className="flex gap-4 max-[360px]:gap-2">
          {itemsNavbar.map((item) => {
            // On Home the scroll spy decides; elsewhere each item maps to its standalone page.
            const isActive = isHome ? activeSection === item.key : pathname === item.page;

            return (
              <Link
                key={item.id}
                href={item.link}
                aria-label={dict.nav[item.key]}
                aria-current={isActive ? (isHome ? 'true' : 'page') : undefined}
                onClick={item.key === 'home' ? (event) => handleHomeLinkClick(event, pathname) : undefined}
                className={`flex items-center justify-center w-14 h-14 max-[360px]:w-12 max-[360px]:h-12 rounded-2xl transition-all duration-300 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400
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
