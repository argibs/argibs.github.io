import { useMemo, useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import { applyFilter, deriveFilters } from '../../utils/filters';
import { asset } from '../../utils/asset';
import type { Project } from '../../types';
import ProjectFilters from './ProjectFilters';
import ProjectGrid from './ProjectGrid';
import ProjectModal from './ProjectModal';
import Lightbox from '../common/Lightbox';
import SectionPanel from '../common/SectionPanel';

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

  if (loading) return <SectionPanel id="projects"><p>Loading projects...</p></SectionPanel>;
  if (error) return <SectionPanel id="projects"><p>Failed to load projects.</p></SectionPanel>;

  return (
    <SectionPanel id="projects">
      <h2 style={{ textAlign: 'center', margin: '0 0 1.2rem', fontSize: '2rem', color: 'var(--text-primary)' }}>Projects</h2>
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
      <ProjectModal
        project={openProject}
        onClose={() => setOpenProject(null)}
        onImageClick={setLightboxSrc}
      />
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </SectionPanel>
  );
}
