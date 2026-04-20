import { BrowserRouter, Routes, Route } from 'react-router';
import TopographicBackground from './components/background/TopographicBackground';
import AppLayout from './components/layout/AppLayout';
import Hero from './components/hero/Hero';
import ProjectsSection from './components/projects/ProjectsSection';
import ChallengeView from './components/challenge/ChallengeView';
import styles from './App.module.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <TopographicBackground />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Hero />} />
            <Route path="projects" element={<ProjectsSection />} />
            <Route path="challenge" element={<ChallengeView />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
