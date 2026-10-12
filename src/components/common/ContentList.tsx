import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ContentList.module.css';

interface Props {
  count: number;
  label: string;
  children: ReactNode;
}

export default function ContentList({ count, label, children }: Props) {
  const content = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setMoreBelow((content.current?.getBoundingClientRect().bottom ?? 0) > window.innerHeight + 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
    if (content.current) observer?.observe(content.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [count]);

  return (
    <>
      <p className={styles.summary} role="status">
        <span>{count} {label}</span>
        {count > 0 && moreBelow && <span className={styles.cue}>&darr; Scroll to see more</span>}
      </p>
      <div ref={content}>{children}</div>
    </>
  );
}
