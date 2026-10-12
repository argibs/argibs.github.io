import type { ChallengeDay } from '../../types';
import ProjectCard from '../projects/ProjectCard';
import { ALGAE_FILLER } from './algaeFiller';
import { asset } from '../../utils/asset';

interface Props {
  day: ChallengeDay;
  onOpen: () => void;
}

export default function DayCard({ day, onOpen }: Props) {
  return (
    <ProjectCard
      project={{ ...day, category: '', subcategory: null }}
      badgeLabel={`Day ${day.day}`}
      imageSrc={day.image ? asset(day.image) : ALGAE_FILLER}
      onOpen={onOpen}
    />
  );
}
