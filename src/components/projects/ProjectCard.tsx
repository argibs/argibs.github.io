import type { Project } from '../../types';
import LazyImage from '../common/LazyImage';
import { asset } from '../../utils/asset';
import styles from './ProjectCard.module.css';

interface Props {
  project: Project;
  onOpen: () => void;
  badgeLabel?: string;
  // Already-resolved URL or data URI; bypasses asset().
  imageSrc?: string;
}

export default function ProjectCard({ project, onOpen, badgeLabel, imageSrc }: Props) {
  const isSvg = imageSrc === undefined && project.image === 'svg';
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onOpen}
    >
      <div className={styles.imageWrap}>
        {isSvg ? (
          <div className={styles.svgPlaceholder} aria-hidden="true" />
        ) : (
          <LazyImage src={imageSrc ?? asset(project.image)} alt={project.title} className={styles.image} />
        )}
        <div className={styles.overlay}>
          <span className={styles.viewDetails}>View Details</span>
        </div>
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{badgeLabel ?? project.category}</span>
        <h2 className={styles.title}>{project.title}</h2>
        <p className={styles.description}>{project.description}</p>
      </div>
    </button>
  );
}
