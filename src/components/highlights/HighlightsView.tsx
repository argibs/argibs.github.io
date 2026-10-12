import { useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { asset } from '../../utils/asset';
import { isHighlightsConfig, pickHighlights } from '../../utils/highlights';
import type { HighlightsConfig, Project } from '../../types';
import HighlightCard from './HighlightCard';
import ProjectModal from '../projects/ProjectModal';
import Lightbox from '../common/Lightbox';
import SectionPanel from '../common/SectionPanel';
import styles from './HighlightsView.module.css';

function HighlightsContent({ projects, config }: { projects: Project[]; config: HighlightsConfig }) {
  const [highlighted, setHighlighted] = useState(() => pickHighlights(projects, config.pool));
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Highlighted Projects</h1>
        <p className={styles.subtitle}>{config.tagline}</p>
        <button type="button" className={styles.refreshBtn} disabled={!highlighted.length}
          onClick={() => setHighlighted(pickHighlights(projects, config.pool))}>Shuffle</button>
      </header>
      {highlighted.length ? (
        <div className={styles.grid}>
          {highlighted.map((project, index) => (
            <HighlightCard key={project.image} project={project} index={index} onOpen={() => setOpenProject(project)} />
          ))}
        </div>
      ) : <p role="status">No highlighted projects are available. Update the Highlights pool to reference available project images.</p>}
      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} onImageClick={setLightboxSrc} />
      <Lightbox src={lightboxSrc} alt={openProject?.title} onClose={() => setLightboxSrc(null)} />
    </>
  );
}

export default function HighlightsView() {
  const projects = useFetchJSON<Project[]>(asset('projects.json'));
  const config = useFetchJSON<unknown>(asset('highlights.json'));
  const loading = projects.loading || config.loading;
  const invalid = !loading && !isHighlightsConfig(config.data);
  const error = projects.error || config.error || invalid;

  return (
    <SectionPanel id="highlights" loading={loading}>
      {loading || error ? (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>Highlighted Projects</h1>
            <button type="button" className={styles.refreshBtn} disabled>Shuffle</button>
          </header>
          {loading ? <p role="status">Loading highlights...</p> :
            <p role="alert">Failed to load highlights. Check the projects and Highlights configuration (tagline and image-path pool).</p>}
        </>
      ) : isHighlightsConfig(config.data) && (
        <HighlightsContent projects={projects.data ?? []} config={config.data} />
      )}
    </SectionPanel>
  );
}
