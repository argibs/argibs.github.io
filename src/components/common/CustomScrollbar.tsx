import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import styles from './CustomScrollbar.module.css';

interface Props {
  scrollRef: RefObject<HTMLElement | null>;
}

export default function CustomScrollbar({ scrollRef }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [needed, setNeeded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ y: 0, scrollTop: 0 });

  const update = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setNeeded(false);
      return;
    }
    setNeeded(true);
    const trackHeight = track.clientHeight;
    const ratio = clientHeight / scrollHeight;
    const height = Math.max(ratio * trackHeight, 32);
    const maxTop = trackHeight - height;
    const top = maxTop > 0 ? (scrollTop / (scrollHeight - clientHeight)) * maxTop : 0;
    setThumbHeight(height);
    setThumbTop(top);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    const mo = new MutationObserver(() => update());
    mo.observe(el, { childList: true, subtree: true });
    update();
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect(); mo.disconnect(); };
  }, [scrollRef, update]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    setDragging(true);
    dragStart.current = { y: e.clientY, scrollTop: el.scrollTop };
  }, [scrollRef]);

  useEffect(() => {
    if (!dragging) return;
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const trackHeight = track.clientHeight;
    const { scrollHeight, clientHeight } = el;
    const scrollRange = scrollHeight - clientHeight;
    const thumbH = Math.max((clientHeight / scrollHeight) * trackHeight, 32);
    const trackRange = trackHeight - thumbH;

    const onMove = (e: MouseEvent) => {
      const dy = e.clientY - dragStart.current.y;
      const scrollDelta = trackRange > 0 ? (dy / trackRange) * scrollRange : 0;
      el.scrollTop = dragStart.current.scrollTop + scrollDelta;
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, scrollRef]);

  const onTrackClick = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track || e.target === thumbRef.current) return;
    const rect = track.getBoundingClientRect();
    const clickRatio = (e.clientY - rect.top) / rect.height;
    el.scrollTop = clickRatio * (el.scrollHeight - el.clientHeight);
  }, [scrollRef]);

  return (
    <div
      ref={trackRef}
      className={`${styles.track} ${needed ? styles.visible : ''}`}
      onClick={onTrackClick}
    >
      {needed && (
        <div
          ref={thumbRef}
          className={styles.thumb}
          style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
          onMouseDown={onMouseDown}
        />
      )}
    </div>
  );
}
