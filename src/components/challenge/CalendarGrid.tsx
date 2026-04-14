import type { ChallengeDay } from '../../types';
import DayCard from './DayCard';
import styles from './CalendarGrid.module.css';

interface Props {
  days: ChallengeDay[];
  onOpenDay: (day: ChallengeDay) => void;
}

export default function CalendarGrid({ days, onOpenDay }: Props) {
  return (
    <div className={styles.grid}>
      {days.map((d) => (
        <DayCard key={d.day} day={d} onOpen={() => onOpenDay(d)} />
      ))}
    </div>
  );
}
