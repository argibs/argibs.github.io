import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return isLanding ? (
    <>
      <Navbar />
      <main className={styles.landingMain}>
        <Outlet />
      </main>
    </>
  ) : (
    <div className={styles.appShell}>
      <Sidebar />
      <main className={styles.contentMain}>
        <Outlet />
      </main>
    </div>
  );
}
