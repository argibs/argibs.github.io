import { useRef, useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { asset } from '../../utils/asset';
import type { CodingProject } from '../../types';
import CodingProjectRow from './CodingProjectRow';
import BaseModal from '../common/BaseModal';
import CustomScrollbar from '../common/CustomScrollbar';
import Lightbox from '../common/Lightbox';
import NotebookViewer from './NotebookViewer';
import SectionPanel from '../common/SectionPanel';
import styles from './CodingProjectsView.module.css';

export default function CodingProjectsView() {
  const { data, loading, error } = useFetchJSON<CodingProject[]>(asset('coding_projects.json'));
  const [openProject, setOpenProject] = useState<CodingProject | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <SectionPanel id="coding">
      <header className={styles.header}>
        <h1 className={styles.title}>Coding Projects</h1>
      </header>
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load projects.</p>}
      {!loading && !error && data && (
        <div className={styles.list}>
          {data.map((project) => (
            <CodingProjectRow
              key={project.title}
              project={project}
              onOpen={() => setOpenProject(project)}
            />
          ))}
        </div>
      )}
      <BaseModal
        open={!!openProject}
        onClose={() => setOpenProject(null)}
        variant="project"
        dialogClassName={styles.notebookDialog}
        header={openProject ? <h2>{openProject.title}</h2> : undefined}
      >
        <div className={styles.notebookScrollWrap}>
          <div ref={scrollRef} className={styles.notebookScroll}>
            {openProject && (
              <NotebookViewer
                notebookPath={openProject.notebook}
                onImageClick={setLightboxSrc}
              />
            )}
          </div>
          <CustomScrollbar scrollRef={scrollRef} />
        </div>
      </BaseModal>
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </SectionPanel>
  );
}
