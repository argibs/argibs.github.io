import { useEffect, useRef, type RefObject } from 'react';

export function useParallax<T extends HTMLElement>(multiplier = 0.1): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = window.scrollY - (el.offsetTop - window.innerHeight);
      el.style.transform = `translateY(${distance * multiplier}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [multiplier]);

  return ref;
}
