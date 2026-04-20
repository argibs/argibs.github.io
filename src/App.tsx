import { useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import TopographicBackground from './components/background/TopographicBackground';
import AppLayout from './components/layout/AppLayout';
import Hero from './components/hero/Hero';
import ProjectsSection from './components/projects/ProjectsSection';
import ChallengeView from './components/challenge/ChallengeView';
import CodingProjectsView from './components/coding/CodingProjectsView';
import WebGISView from './components/webgis/WebGISView';
import styles from './App.module.css';

export default function App() {
  const [ready, setReady] = useState(false);
  const onBgReady = useCallback(() => setReady(true), []);

  return (
    <BrowserRouter>
      <div className={`${styles.app} ${ready ? styles.ready : ''}`}>
        <TopographicBackground onReady={onBgReady} />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Hero />} />
            <Route path="projects" element={<ProjectsSection />} />
            <Route path="challenge" element={<ChallengeView />} />
            <Route path="coding" element={<CodingProjectsView />} />
            <Route path="webgis" element={<WebGISView />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
