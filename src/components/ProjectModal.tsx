import React, { useEffect, useState } from 'react';
import { ModalData } from '../types';
import Lightbox from './Lightbox';

interface ProjectModalProps {
  isOpen: boolean;
  data: ModalData | null;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, data, onClose }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="close-modal" onClick={onClose} aria-label="Close modal">
            ×
          </button>

          <img
            src={data.image}
            alt={data.title}
            className="modal-image"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />

          <div className="modal-body">
            {data.day !== undefined && (
              <div className="modal-day-header">
                <span className="modal-day-number">Day {data.day}</span>
                {data.date && <span className="modal-day-date">{data.date}</span>}
              </div>
            )}

            {data.category && (
              <div className="modal-category">
                {data.category}
                {data.subcategory && ` • ${data.subcategory}`}
              </div>
            )}

            <h2 className="modal-title">{data.title}</h2>

            <p className="modal-description">{data.description}</p>

            <div className="modal-full-description">
              {data.fullDescription}
            </div>

            {data.pdfLink && (
              <a
                href={data.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-link-button"
              >
                View PDF Report
              </a>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        imageSrc={data.image}
        imageAlt={data.title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default ProjectModal;
