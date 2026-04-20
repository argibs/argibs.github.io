import { Link, useLocation } from 'react-router';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import { asset } from '../../utils/asset';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/highlights', label: 'Highlights' },
  { to: '/projects', label: 'Projects' },
  { to: '/challenge', label: '30 Day Map Challenge' },
  { to: '/coding', label: 'Coding Projects' },
  { to: '/webgis', label: 'Web GIS Experience' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.identity}>
        <img
          src={asset('assets/images/IMG_3908.JPG')}
          alt="Ashton Gibson"
          className={styles.photo}
        />
        <h2 className={styles.name}>Ashton Gibson</h2>
        <p className={styles.title}>GIS Specialist</p>
      </Link>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`${styles.navLink} ${isActive(item.to) ? styles.active : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={asset('assets/resume/Resume11-3-25.pdf')}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navLink}
        >
          Resume <ExternalLinkIcon className={styles.externalIcon} />
        </a>
      </nav>

      <div className={styles.social}>
        <a
          href="https://www.linkedin.com/in/ashton-gibson-20b956272/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkedinLink}
          aria-label="LinkedIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
