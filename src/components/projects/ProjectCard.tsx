import type { Project } from '../../types';
import LazyImage from '../common/LazyImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { asset } from '../../utils/asset';
import styles from './ProjectCard.module.css';

interface Props {
  project: Project;
  onOpen: () => void;
}

export default function ProjectCard({ project, onOpen }: Props) {
  const [ref, visible] = useIntersectionObserver<HTMLButtonElement>();
  const isSvg = project.image === 'svg';
  return (
    <button
      type="button"
      ref={ref}
      className={`${styles.card} ${visible ? styles.visible : ''}`}
      onClick={onOpen}
    >
      <div className={styles.imageWrap}>
        {isSvg ? (
          <div className={styles.svgPlaceholder} aria-hidden="true" />
        ) : (
          <LazyImage src={asset(project.image)} alt={project.title} className={styles.image} />
        )}
        <div className={styles.overlay}>
          <span className={styles.viewDetails}>View Details</span>
        </div>
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{project.category}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
      </div>
    </button>
  );
}
