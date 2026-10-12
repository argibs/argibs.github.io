import { Outlet, useLocation } from 'react-router';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const location = useLocation();
  useScrollRestoration();
  const isLanding = location.pathname === '/';

  return (
    <>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <Navbar key={location.pathname} compactOnly={!isLanding} />
      <div className={isLanding ? styles.landingShell : styles.appShell}>
        {!isLanding && <Sidebar />}
        <main
          id="main-content"
          tabIndex={-1}
          className={isLanding ? styles.landingMain : styles.contentMain}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}
