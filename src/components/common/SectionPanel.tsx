import { useRef, type ReactNode } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import CustomScrollbar from './CustomScrollbar';
import styles from './SectionPanel.module.css';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function SectionPanel({ id, children, className }: Props) {
  const [sectionRef, visible] = useIntersectionObserver<HTMLElement>({ threshold: 0.05 });
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ''} ${className ?? ''}`}
    >
      <div className={styles.container}>
        <div className={styles.panelWrap}>
          <div ref={panelRef} className={styles.panel}>
            {children}
          </div>
          <CustomScrollbar scrollRef={panelRef} />
        </div>
      </div>
    </section>
  );
}
