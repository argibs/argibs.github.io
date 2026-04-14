import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './FilterDropdown.module.css';

interface Props {
  label: string;
  options: string[];
  selected: string | null;
  active: boolean;
  onSelect: (value: string | null) => void;
}

/**
 * Matches the original static-site filter structure (styles.css 679-856,
 * script.js buildFilters + computeFlipForDropdown 858-878):
 *   <div class="filter-dropdown-wrapper">
 *     <button class="filter-btn-with-dropdown [active]">
 *       <span>{Label}</span>
 *       <span class="subcategory-badge [visible]">{selected}</span>
 *     </button>
 *     <div class="filter-dropdown [open] [flip]" role="menu">
 *       <div class="filter-dropdown-item [selected]">All</div>
 *       {options...}
 *     </div>
 *   </div>
 */
export default function FilterDropdown({ label, options, selected, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Match button width to dropdown width and compute smart flip (script.js:858-878).
  useLayoutEffect(() => {
    if (!open) return;
    const wrapper = wrapperRef.current;
    const button = buttonRef.current;
    const dd = dropdownRef.current;
    if (!wrapper || !button || !dd) return;

    dd.style.minWidth = `${button.offsetWidth}px`;

    const wrapperRect = wrapper.getBoundingClientRect();
    const rect = dd.getBoundingClientRect();
    const spaceBelow = window.innerHeight - wrapperRect.bottom;
    const spaceAbove = wrapperRect.top;
    setFlip(spaceBelow < rect.height + 12 && spaceAbove > rect.height + 12);
  }, [open]);

  // Outside click closes; window resize recomputes flip.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onResize = () => {
      const wrapper = wrapperRef.current;
      const dd = dropdownRef.current;
      if (!wrapper || !dd) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const rect = dd.getBoundingClientRect();
      const spaceBelow = window.innerHeight - wrapperRect.bottom;
      const spaceAbove = wrapperRect.top;
      setFlip(spaceBelow < rect.height + 12 && spaceAbove > rect.height + 12);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const badgeText = selected ?? (active ? 'All' : '');
  const badgeVisible = active; // Show badge when this category is active (All or specific sub).

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`${styles.button} ${active ? styles.active : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span>{label}</span>
        <span className={`${styles.badge} ${badgeVisible ? styles.badgeVisible : ''}`}>
          {badgeText}
        </span>
      </button>
      <div
        ref={dropdownRef}
        role="menu"
        className={`${styles.dropdown} ${open ? styles.open : ''} ${flip ? styles.flip : ''}`}
      >
        <div
          role="menuitem"
          tabIndex={0}
          className={`${styles.item} ${active && selected === null ? styles.selected : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
            setOpen(false);
          }}
        >
          All
        </div>
        {options.map((opt) => (
          <div
            key={opt}
            role="menuitem"
            tabIndex={0}
            className={`${styles.item} ${selected === opt ? styles.selected : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt);
              setOpen(false);
            }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}
