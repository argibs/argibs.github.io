import type { Project } from '../../types';
import ProjectCard from './ProjectCard';
import styles from './ProjectGrid.module.css';

interface Props {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export default function ProjectGrid({ projects, onOpen }: Props) {
  return (
    <div className={styles.grid}>
      {projects.map((p, i) => (
        <ProjectCard key={`${p.title}-${i}`} project={p} onOpen={() => onOpen(p)} />
      ))}
    </div>
  );
}
