import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import type { WebGISProject } from '../../types';
import styles from './WebGISRow.module.css';

interface Props {
  project: WebGISProject;
}

export default function WebGISRow({ project }: Props) {
  const [ref, visible] = useIntersectionObserver<HTMLDivElement>();

  return (
    <div ref={ref} className={`${styles.row} ${visible ? styles.visible : ''}`}>
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
      {project.highlights.length > 0 && (
        <ul className={styles.highlights}>
          {project.highlights.map((h, i) => (
            <li key={i}>
              <span>{h.text}</span>
              {h.linkUrl && (
                <a
                  href={h.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.inlineLink}
                >
                  {h.linkLabel || 'View'} <ExternalLinkIcon size={12} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
