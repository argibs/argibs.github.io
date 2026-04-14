import Navbar from './components/layout/Navbar';
import TopographicBackground from './components/background/TopographicBackground';
import ScrollProgress from './components/layout/ScrollProgress';
import Hero from './components/hero/Hero';
import ProjectsSection from './components/projects/ProjectsSection';
import ChallengeView from './components/challenge/ChallengeView';
import Footer from './components/layout/Footer';
import styles from './App.module.css';

export default function App() {
  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.app}>
      <TopographicBackground />
      <ScrollProgress />
      <Navbar onNavigate={handleNavigate} />
      <main>
        <Hero />
        <ProjectsSection />
        <ChallengeView />
      </main>
      <Footer />
    </div>
  );
}
