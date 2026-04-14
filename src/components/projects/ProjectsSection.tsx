import { useMemo, useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { applyFilter, deriveFilters } from '../../utils/filters';
import { asset } from '../../utils/asset';
import type { Project } from '../../types';
import ProjectFilters from './ProjectFilters';
import ProjectGrid from './ProjectGrid';
import ProjectModal from './ProjectModal';
import Lightbox from '../common/Lightbox';
import styles from './ProjectsSection.module.css';

export default function ProjectsSection() {
  const { data, loading, error } = useFetchJSON<Project[]>(asset('projects.json'));
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const filters = useMemo(() => (data ? deriveFilters(data) : []), [data]);
  const visible = useMemo(
    () => (data ? applyFilter(data, category, subcategory) : []),
    [data, category, subcategory],
  );

  if (loading)
    return (
      <section id="projects" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <p>Loading projects...</p>
          </div>
        </div>
      </section>
    );
  if (error)
    return (
      <section id="projects" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <p>Failed to load projects.</p>
          </div>
        </div>
      </section>
    );

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.panel}>
          <h2 className={styles.heading}>Projects</h2>
          <ProjectFilters
            filters={filters}
            activeCategory={category}
            activeSubcategory={subcategory}
            onChange={(cat, sub) => {
              setCategory(cat);
              setSubcategory(sub);
            }}
          />
          <ProjectGrid projects={visible} onOpen={setOpenProject} />
        </div>
      </div>
      <ProjectModal
        project={openProject}
        onClose={() => setOpenProject(null)}
        onImageClick={setLightboxSrc}
      />
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </section>
  );
}
