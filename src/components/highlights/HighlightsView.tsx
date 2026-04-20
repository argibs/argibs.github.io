import { useMemo, useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { asset } from '../../utils/asset';
import type { Project } from '../../types';
import HighlightCard from './HighlightCard';
import ProjectModal from '../projects/ProjectModal';
import Lightbox from '../common/Lightbox';
import SectionPanel from '../common/SectionPanel';
import styles from './HighlightsView.module.css';

export default function HighlightsView() {
  const { data, loading, error } = useFetchJSON<Project[]>(asset('projects.json'));
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const highlighted = useMemo(
    () => (data ? data.slice(-5).reverse() : []),
    [data],
  );

  return (
    <SectionPanel id="highlights">
      <header className={styles.header}>
        <h1 className={styles.title}>Highlighted Projects</h1>
        <p className={styles.subtitle}>Latest work</p>
      </header>
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load projects.</p>}
      {!loading && !error && (
        <div className={styles.grid}>
          {highlighted.map((project, i) => (
            <HighlightCard
              key={project.title}
              project={project}
              index={i}
              onOpen={() => setOpenProject(project)}
            />
          ))}
        </div>
      )}
      <ProjectModal
        project={openProject}
        onClose={() => setOpenProject(null)}
        onImageClick={setLightboxSrc}
      />
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </SectionPanel>
  );
}
