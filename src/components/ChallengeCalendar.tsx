import React, { useState, useEffect } from 'react';
import { ChallengeDay, ModalData } from '../types';
import ProjectModal from './ProjectModal';

const getAlgaeFiller = () => {
  const svg = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="algaeGradient">
        <stop offset="0%" stop-color="#27ae60" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#16a085" stop-opacity="0.3"/>
      </radialGradient>
    </defs>
    <ellipse cx="200" cy="150" rx="150" ry="100" fill="url(#algaeGradient)"/>
    <circle cx="180" cy="130" r="15" fill="#27ae60" opacity="0.6"/>
    <circle cx="220" cy="160" r="12" fill="#27ae60" opacity="0.7"/>
    <circle cx="200" cy="145" r="18" fill="#2ecc71" opacity="0.8"/>
    <path d="M150 150 Q200 120 250 150" stroke="#16a085" stroke-width="2" fill="none" opacity="0.5"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

const ChallengeCalendar: React.FC = () => {
  const [challengeData, setChallengeData] = useState<ChallengeDay[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => {
    loadChallengeData();
  }, []);

  const loadChallengeData = async () => {
    try {
      const response = await fetch('/challenge2025.json');
      const data: ChallengeDay[] = await response.json();
      setChallengeData(data);
    } catch (error) {
      console.error('Error loading challenge data:', error);
    }
  };

  const openChallengeModal = (dayData: ChallengeDay) => {
    const data: ModalData = {
      title: dayData.title || `Day ${dayData.day}`,
      description: dayData.description || 'Check back soon...',
      fullDescription: dayData.fullDescription || '',
      image: dayData.image || getAlgaeFiller(),
      day: dayData.day,
      date: `November ${dayData.day}, 2025`,
    };
    setModalData(data);
    setModalOpen(true);
  };

  // Create array of 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dayData = challengeData.find((d) => d.day === day);
    return dayData || { day, title: '', description: '', image: '', fullDescription: '' };
  });

  return (
    <section id="challenge" className="challenge-section">
      <div className="challenge-wrapper">
        <div className="challenge-header">
          <h1 className="challenge-title">30 Day Map Challenge 2025</h1>
          <p className="challenge-subtitle">November 2025 · Daily Mapping Challenge</p>
        </div>

        <div className="calendar-container">
          <div className="calendar-grid">
            {days.map((dayData) => (
              <div
                key={dayData.day}
                className="calendar-day"
                onClick={() => openChallengeModal(dayData)}
              >
                <div className="calendar-day-number">{dayData.day}</div>
                <img
                  src={dayData.image || getAlgaeFiller()}
                  alt={`Day ${dayData.day}`}
                  className={`calendar-day-image ${
                    !dayData.image ? 'calendar-algae-filler' : ''
                  }`}
                />
                {dayData.title && dayData.title.trim() !== '' && (
                  <div className="calendar-day-title">{dayData.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectModal
        isOpen={modalOpen}
        data={modalData}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};

export default ChallengeCalendar;
