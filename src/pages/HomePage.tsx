import React from 'react';
import Hero from '../components/Hero';
import Projects from '../components/Projects';

const HomePage: React.FC = () => {
  return (
    <div className="main-view">
      <Hero />
      <Projects />
    </div>
  );
};

export default HomePage;
