import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import styles from './FilterDropdown.module.css';

interface Props {
  label: string;
  options: string[];
  selected: string | null;
  active: boolean;
  onSelect: (value: string | null) => void;
}

export default function FilterDropdown({ label, options, selected, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const wrapper = wrapperRef.current;
      const menu = dropdownRef.current;
      if (!wrapper || !menu) return;
      const rect = wrapper.getBoundingClientRect();
      const gap = 6;
      const edge = 8;
      const below = Math.max(0, window.innerHeight - rect.bottom - gap - edge);
      const above = Math.max(0, rect.top - gap - edge);
      const height = menu.scrollHeight + 4; // Include the menu border, not its animated scale.
      const flip = below < height && above > below;
      menu.style.top = flip ? 'auto' : 'calc(100% + 6px)';
      menu.style.bottom = flip ? 'calc(100% + 6px)' : 'auto';
      menu.style.transformOrigin = flip ? 'bottom' : 'top';
      menu.style.maxHeight = `${flip ? above : below}px`;
      menu.style.overflowY = 'auto';
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(position) : null;
    if (dropdownRef.current) observer?.observe(dropdownRef.current);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      observer?.disconnect();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const select = (value: string | null) => {
    onSelect(value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button type="button" ref={buttonRef} className={`${styles.button} ${active ? styles.active : ''}`}
        aria-expanded={open} aria-controls={id}
        onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <span className={`${styles.badge} ${active ? styles.badgeVisible : ''}`}>{selected ?? (active ? 'All' : '')}</span>
      </button>
      {open && <div ref={dropdownRef} id={id} className={`${styles.dropdown} ${styles.open}`} aria-label={`${label} options`}>
        <button type="button" className={`${styles.item} ${active && selected === null ? styles.selected : ''}`} onClick={() => select(null)}>All</button>
        {options.map((option) => <button type="button" key={option} className={`${styles.item} ${selected === option ? styles.selected : ''}`} onClick={() => select(option)}>{option}</button>)}
      </div>}
    </div>
  );
}
