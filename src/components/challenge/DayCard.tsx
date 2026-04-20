import type { ChallengeDay } from '../../types';
import LazyImage from '../common/LazyImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { ALGAE_FILLER } from './algaeFiller';
import { asset } from '../../utils/asset';
import styles from './DayCard.module.css';

interface Props {
  day: ChallengeDay;
  onOpen: () => void;
}

export default function DayCard({ day, onOpen }: Props) {
  const [ref, visible] = useIntersectionObserver<HTMLButtonElement>();
  const imgSrc = day.image ? asset(day.image) : ALGAE_FILLER;
  return (
    <button
      type="button"
      ref={ref}
      className={`${styles.card} ${visible ? styles.visible : ''}`}
      onClick={onOpen}
      aria-label={`Day ${day.day}: ${day.title}`}
    >
      <span className={styles.dayNumber}>Day {day.day}</span>
      <LazyImage src={imgSrc} alt={day.title} className={styles.image} />
      <span className={styles.title}>{day.title}</span>
    </button>
  );
}
