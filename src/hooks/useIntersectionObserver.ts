import { useEffect, useRef, useState, type RefObject } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: Options = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '-50px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}
