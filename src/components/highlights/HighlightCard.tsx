import type { Project } from '../../types';
import LazyImage from '../common/LazyImage';
import { asset } from '../../utils/asset';
import styles from './HighlightCard.module.css';

interface Props {
  project: Project;
  index: number;
  onOpen: () => void;
}

export default function HighlightCard({ project, index, onOpen }: Props) {
  const isSvg = project.image === 'svg';

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onOpen}
    >
      <div className={styles.imageWrap}>
        {isSvg ? (
          <div className={styles.placeholder} />
        ) : (
          <LazyImage src={asset(project.image)} alt={project.title} className={styles.image} />
        )}
        <div className={styles.overlay}>
          <span className={styles.viewDetails}>View Details</span>
        </div>
      </div>
      <div className={styles.body}>
        <span className={styles.number}>#{index + 1}</span>
        <span className={styles.category}>{project.category}</span>
        <h2 className={styles.title}>{project.title}</h2>
        <p className={styles.description}>{project.description}</p>
      </div>
    </button>
  );
}
