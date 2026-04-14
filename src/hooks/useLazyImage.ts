import { useEffect, useRef, useState, type RefObject } from 'react';

export function useLazyImage(src: string): [RefObject<HTMLImageElement | null>, string | undefined] {
  const ref = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setLoadedSrc(src);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadedSrc(src);
        io.unobserve(el);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return [ref, loadedSrc];
}
