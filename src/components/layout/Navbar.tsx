import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import { asset } from '../../utils/asset';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const close = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar}>
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
          <Link
            to="/highlights"
            className={isActive('/highlights') ? styles.active : ''}
            onClick={close}
          >
            Highlights
          </Link>
        </li>
        <li>
          <Link
            to="/projects"
            className={isActive('/projects') ? styles.active : ''}
            onClick={close}
          >
            Projects
          </Link>
        </li>
        <li>
          <Link
            to="/challenge"
            className={isActive('/challenge') ? styles.active : ''}
            onClick={close}
          >
            30 Day Map Challenge
          </Link>
        </li>
        <li>
          <Link
            to="/coding"
            className={isActive('/coding') ? styles.active : ''}
            onClick={close}
          >
            Coding Projects
          </Link>
        </li>
        <li>
          <Link
            to="/webgis"
            className={isActive('/webgis') ? styles.active : ''}
            onClick={close}
          >
            Web GIS Experience
          </Link>
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
