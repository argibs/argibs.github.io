import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import TopographicBackground from './components/TopographicBackground';
import ScrollProgress from './components/ScrollProgress';
import HomePage from './pages/HomePage';
import ChallengePage from './pages/ChallengePage';

const App: React.FC = () => {
  return (
    <Router>
      <TopographicBackground />
      <ScrollProgress />
      <Navigation />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;
