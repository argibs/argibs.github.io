import { useFetchJSON } from '../../hooks/useFetchJSON';
import { asset } from '../../utils/asset';
import type { WebGISProject } from '../../types';
import WebGISRow from './WebGISRow';
import SectionPanel from '../common/SectionPanel';
import styles from './WebGISView.module.css';

export default function WebGISView() {
  const { data, loading, error } = useFetchJSON<WebGISProject[]>(asset('webgis_projects.json'));

  return (
    <SectionPanel id="webgis">
      <header className={styles.header}>
        <h1 className={styles.title}>Web GIS Experience</h1>
      </header>
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load projects.</p>}
      {!loading && !error && data && (
        <div className={styles.list}>
          {data.map((project) => (
            <WebGISRow key={project.title} project={project} />
          ))}
        </div>
      )}
    </SectionPanel>
  );
}
