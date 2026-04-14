import type { Project } from '../../types';
import BaseModal from '../common/BaseModal';
import { asset } from '../../utils/asset';
import styles from './ProjectModal.module.css';

interface Props {
  project: Project | null;
  onClose: () => void;
  onImageClick: (src: string) => void;
}

export default function ProjectModal({ project, onClose, onImageClick }: Props) {
  if (!project) return null;
  const imgSrc = asset(
    project.image === 'svg' ? 'assets/images/lake_michigan.png' : project.image,
  );
  return (
    <BaseModal
      open={!!project}
      onClose={onClose}
      variant="project"
      labelledBy="project-modal-title"
    >
      <div className={styles.imageSection}>
        <img
          src={imgSrc}
          alt={project.title}
          className={styles.image}
          onClick={() => onImageClick(imgSrc)}
        />
      </div>
      <div className={styles.infoSection}>
        <span className={styles.category}>{project.category}</span>
        <h2 id="project-modal-title" className={styles.title}>
          {project.title}
        </h2>
        <p className={styles.lead}>{project.description}</p>
        {project.fullDescription && (
          <p className={styles.description}>{project.fullDescription}</p>
        )}
      </div>
    </BaseModal>
  );
}
