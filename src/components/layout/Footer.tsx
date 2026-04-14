import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>© 2024 Ashton Gibson. All rights reserved.</p>
        <p className={styles.subtitle}>GIS Portfolio · University of Michigan</p>
      </div>
    </footer>
  );
}
