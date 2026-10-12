import type { CodingProject } from '../../types';
import styles from './CodingProjectRow.module.css';

interface Props {
  project: CodingProject;
  onOpen: () => void;
}

export default function CodingProjectRow({ project, onOpen }: Props) {
  return (
    <button type="button" className={styles.row} onClick={onOpen}>
      <div className={styles.header}>
        <h2 className={styles.title}>{project.title}</h2>
        <span className={styles.date}>{project.date}</span>
      </div>
      <div className={styles.tags}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      <p className={styles.description}>{project.description}</p>
      <span className={styles.arrow}>&#8250;</span>
    </button>
  );
}
