import type { MouseEvent } from 'react';

// Next.js jumps to the top instantly when the current URL is "/" again. On Home, links to "/" (dock button,
// header logo) scroll there smoothly instead (CSS scroll-behavior honors reduced motion) and drop the section
// hash. Modified clicks (new tab, etc.) keep the default behavior.
export const handleHomeLinkClick = (event: MouseEvent<HTMLAnchorElement>, pathname: string) => {
  if (pathname !== '/' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.scrollTo({ top: 0 });
  if (window.location.hash) window.history.pushState(null, '', '/');
};
