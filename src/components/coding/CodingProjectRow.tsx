import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { CodingProject } from '../../types';
import styles from './CodingProjectRow.module.css';

interface Props {
  project: CodingProject;
  onOpen: () => void;
}

export default function CodingProjectRow({ project, onOpen }: Props) {
  const [ref, visible] = useIntersectionObserver<HTMLDivElement>();

  return (
    <div ref={ref} className={`${styles.row} ${visible ? styles.visible : ''}`} onClick={onOpen}>
      <div className={styles.header}>
        <h3 className={styles.title}>{project.title}</h3>
        <span className={styles.date}>{project.date}</span>
      </div>
      <div className={styles.tags}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      <p className={styles.description}>{project.description}</p>
      <span className={styles.arrow}>&#8250;</span>
    </div>
  );
}
