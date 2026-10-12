import type { ReactNode } from 'react';
import styles from './SectionPanel.module.css';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export default function SectionPanel({ id, children, className, loading = false }: Props) {
  return (
    <section
      id={id}
      aria-busy={loading}
      className={`${styles.section} ${className ?? ''}`}
    >
      <div className={styles.panel}>
        {children}
      </div>
    </section>
  );
}
