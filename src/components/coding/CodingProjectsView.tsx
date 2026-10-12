import { useId, useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { asset } from '../../utils/asset';
import type { CodingProject } from '../../types';
import CodingProjectRow from './CodingProjectRow';
import BaseModal from '../common/BaseModal';
import Lightbox from '../common/Lightbox';
import NotebookViewer from './NotebookViewer';
import SectionPanel from '../common/SectionPanel';
import ContentList from '../common/ContentList';
import styles from './CodingProjectsView.module.css';

export default function CodingProjectsView() {
  const { data, loading, error } = useFetchJSON<CodingProject[]>(asset('coding_projects.json'));
  const [openProject, setOpenProject] = useState<CodingProject | null>(null);
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const titleId = useId();

  return (
    <SectionPanel id="coding" loading={loading}>
      <header className={styles.header}>
        <h1 className={styles.title}>Coding Projects</h1>
      </header>
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load projects.</p>}
      {!loading && !error && data && (
        <ContentList count={data.length} label={data.length === 1 ? 'project' : 'projects'}>
          <div className={styles.list}>
            {data.map((project) => (
              <CodingProjectRow
                key={project.title}
                project={project}
                onOpen={() => setOpenProject(project)}
              />
            ))}
          </div>
        </ContentList>
      )}
      <BaseModal
        open={!!openProject}
        onClose={() => setOpenProject(null)}
        variant="project"
        dialogClassName={styles.notebookDialog}
        labelledBy={titleId}
        header={openProject ? <h2 id={titleId}>{openProject.title}</h2> : undefined}
      >
        {openProject && <NotebookViewer notebookPath={openProject.notebook} title={openProject.title} imageOpen={!!image} onImageClick={(src, alt) => setImage({ src, alt })} />}
      </BaseModal>
      <Lightbox src={image?.src ?? null} alt={image?.alt} onClose={() => setImage(null)} />
    </SectionPanel>
  );
}
