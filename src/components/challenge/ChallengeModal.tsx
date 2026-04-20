import type { ChallengeDay } from '../../types';
import BaseModal from '../common/BaseModal';
import { ALGAE_FILLER } from './algaeFiller';
import { asset } from '../../utils/asset';
import styles from './ChallengeModal.module.css';

interface Props {
  day: ChallengeDay | null;
  onClose: () => void;
  onImageClick: (src: string) => void;
}

/**
 * Mirrors ProjectModal's two-column layout. The only structural difference
 * is the pill badge: ChallengeModal uses `dayLabel` where ProjectModal uses
 * `category`.
 */
export default function ChallengeModal({ day, onClose, onImageClick }: Props) {
  if (!day) return null;
  const imgSrc = day.image ? asset(day.image) : ALGAE_FILLER;
  return (
    <BaseModal
      open={!!day}
      onClose={onClose}
      variant="challenge"
      labelledBy="challenge-modal-title"
    >
      <div className={styles.imageSection}>
        <div className={styles.imageWrap} onClick={() => onImageClick(imgSrc)}>
          <img src={imgSrc} alt={day.title} className={styles.image} />
          <span className={styles.expandHint}>Click the image to expand</span>
        </div>
      </div>
      <div className={styles.infoSection}>
        <span className={styles.dayLabel}>Day {day.day}</span>
        <h2 id="challenge-modal-title" className={styles.title}>
          {day.title}
        </h2>
        <p className={styles.description}>{day.description}</p>
        {day.fullDescription && (
          <p className={styles.description}>{day.fullDescription}</p>
        )}
      </div>
    </BaseModal>
  );
}
