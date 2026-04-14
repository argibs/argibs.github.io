import type { ReactNode } from 'react';
import styles from './SectionPanel.module.css';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function SectionPanel({ id, children, className }: Props) {
  return (
    <section id={id} className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.container}>
        <div className={styles.panel}>{children}</div>
      </div>
    </section>
  );
}
