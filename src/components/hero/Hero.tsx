import { Link } from 'react-router';
import ExternalLinkIcon from '../common/ExternalLinkIcon';
import { asset } from '../../utils/asset';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.name}>Ashton Gibson</h1>
          <p className={styles.tagline}>GIS Specialist | Environmental Science | Cartographic Design</p>
          <p className={styles.location}>University of Michigan - Geospatial Data Science</p>

          <div className={styles.skillsCompact}>
            <span className={styles.compactLabel}>Technical Expertise:</span>
            <div className={styles.skillsList}>
              <div className={styles.chip}>
                <span className={styles.chipIcon}>📊</span>
                <span className={styles.chipText}>Data Management</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipIcon}>🗺️</span>
                <span className={styles.chipText}>Spatial Analysis</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipIcon}>🌐</span>
                <span className={styles.chipText}>Interactive Maps</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipIcon}>🎨</span>
                <span className={styles.chipText}>Cartography</span>
              </div>
            </div>
          </div>

          <div className={styles.connectCompact}>
            <span className={styles.compactLabel}>Let's Connect:</span>
            <div className={styles.connectList}>
              <a
                href="https://www.linkedin.com/in/ashton-gibson-20b956272/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.connectButton}
              >
                <span className={styles.connectButtonIcon}>💼</span>
                <span className={styles.connectButtonText}>LinkedIn</span>
                <ExternalLinkIcon className={styles.externalIcon} />
              </a>
              <a
                href={asset('assets/resume/Resume11-3-25.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.connectButton}
              >
                <span className={styles.connectButtonIcon}>📄</span>
                <span className={styles.connectButtonText}>Resume</span>
                <ExternalLinkIcon className={styles.externalIcon} />
              </a>
              <Link
                to="/projects"
                className={`${styles.connectButton} ${styles.connectButtonPrimary}`}
              >
                <span className={styles.connectButtonIcon}>→</span>
                <span className={styles.connectButtonText}>View Projects</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.bioSection}>
          <div className={styles.portrait}>
            <img src={asset('assets/images/IMG_3908.JPG')} alt="Ashton Gibson" />
          </div>
          <div className={styles.bioText}>
            <p className={styles.bioLead}>
              Passionate about applying Geographic Information Systems for environmental conservation and scientific communication through mapping.
            </p>
            <p className={styles.bioSecondary}>
              Through coursework and and internship experiences, I've developed expertise in spatial analysis and creating compelling cartographic designs that communicate complex spatial data to diverse audiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
