import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import { asset } from '../../utils/asset';
import { navItems } from './navigation';
import styles from './Navbar.module.css';

export default function Navbar({ compactOnly = false }: { compactOnly?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const links = (
    <ul className={styles.menu}>
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) => isActive ? styles.active : ''}
            onClick={close}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
      <li>
        <a
          href={asset('assets/resume/Resume11-3-25.pdf')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          Resume <ExternalLinkIcon className={styles.externalIcon} />
        </a>
      </li>
    </ul>
  );

  return (
    <header
      className={`${styles.navbar} ${compactOnly ? styles.compactOnly : ''}`}
    >
      <Link to="/" className={styles.identity} onClick={close}>
        Ashton Gibson
      </Link>
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        {links}
      </nav>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? '\u00d7' : '\u2630'}</span>
        <span>Menu</span>
      </button>
      <nav id={menuId} className={styles.compactNav} aria-label="Mobile navigation" hidden={!menuOpen}>
        {links}
      </nav>
    </header>
  );
}
