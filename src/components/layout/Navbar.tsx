import { useEffect, useState } from 'react';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import { asset } from '../../utils/asset';
import styles from './Navbar.module.css';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (section: string) => () => {
    onNavigate(section);
    setMenuOpen(false);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <button type="button" className={styles.brand} onClick={go('hero')}>
        Ashton Gibson
      </button>
      <button
        type="button"
        className={styles.toggle}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <ul className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
        <li>
          <button type="button" onClick={go('hero')}>Home</button>
        </li>
        <li>
          <button type="button" onClick={go('projects')}>Projects</button>
        </li>
        <li>
          <button type="button" onClick={go('challenge')}>30 Day Map Challenge 2025</button>
        </li>
        <li>
          <a href={asset('assets/resume/Resume11-3-25.pdf')} target="_blank" rel="noopener noreferrer">
            Resume <ExternalLinkIcon className={styles.externalIcon} />
          </a>
        </li>
      </ul>
    </nav>
  );
}
