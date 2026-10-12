// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import CalendarGrid from '../components/challenge/CalendarGrid';
import DayCard from '../components/challenge/DayCard';
import { ALGAE_FILLER } from '../components/challenge/algaeFiller';
import ProjectCard from '../components/projects/ProjectCard';
import type { ChallengeDay, Project } from '../types';

afterEach(cleanup);

const firstDay: ChallengeDay = {
  day: 1,
  title: 'Points across the city',
  description: 'A point map of community gardens.',
  image: 'assets/images/day-one.png',
  fullDescription: 'Original day one details.',
};
const lastDay: ChallengeDay = {
  day: 30,
  title: 'The final map',
  description: 'A reflection on thirty maps.',
  image: '',
  fullDescription: 'Original final day details.',
};

it.each([firstDay, lastDay])('shows Day $day in the shared card badge, with a heading and description', (day) => {
  render(<DayCard day={day} onOpen={() => {}} />);
  const card = screen.getByRole('button', { name: new RegExp(day.title) });
  expect(within(card).getByText(`Day ${day.day}`).textContent).toBe(`Day ${day.day}`);
  expect(within(card).getByRole('heading', { level: 2, name: day.title })).toBeTruthy();
  expect(within(card).getByText(day.description)).toBeTruthy();
  expect(within(card).queryByText(/^(coursework|personal)$/i)).toBeNull();
});

it('resolves a challenge image from public assets and preserves the data URI fallback', () => {
  render(<CalendarGrid days={[firstDay, lastDay]} onOpenDay={() => {}} />);
  expect(screen.getByRole('img', { name: firstDay.title }).getAttribute('src')).toBe('/assets/images/day-one.png');
  expect(screen.getByRole('img', { name: lastDay.title }).getAttribute('src')).toBe(ALGAE_FILLER);
  expect(ALGAE_FILLER.startsWith('data:image/svg+xml')).toBe(true);
});

it.each([
  { day: firstDay, action: 'Enter' },
  { day: lastDay, action: 'Space' },
  { day: firstDay, action: 'click' },
])('opens the original Day $day.day record via $action on its native button', async ({ day, action }) => {
  const user = userEvent.setup();
  const onOpenDay = vi.fn();
  render(<CalendarGrid days={[firstDay, lastDay]} onOpenDay={onOpenDay} />);
  const card = screen.getByRole('button', { name: new RegExp(day.title) });
  expect(card.tagName).toBe('BUTTON');
  expect(card.getAttribute('type')).toBe('button');
  if (action === 'click') {
    await user.click(card);
  } else {
    card.focus();
    await user.keyboard(action === 'Enter' ? '{Enter}' : ' ');
  }
  expect(onOpenDay).toHaveBeenCalledExactlyOnceWith(day);
  expect(onOpenDay.mock.calls[0][0]).toBe(day);
});

it('keeps the source project category, image, heading and description without overrides', async () => {
  const user = userEvent.setup();
  const onOpen = vi.fn();
  const project: Project = {
    category: 'coursework',
    subcategory: 'EAS 541',
    title: 'Forest canopy',
    description: 'A LiDAR canopy-height map.',
    image: 'assets/images/canopy.png',
    fullDescription: 'Original project details.',
  };
  render(<ProjectCard project={project} onOpen={onOpen} />);
  const card = screen.getByRole('button', { name: /Forest canopy/ });
  expect(within(card).getByText('coursework')).toBeTruthy();
  expect(within(card).queryByText(/^Day \d+$/)).toBeNull();
  expect(within(card).getByRole('heading', { level: 2, name: project.title })).toBeTruthy();
  expect(within(card).getByText(project.description)).toBeTruthy();
  expect(within(card).getByRole('img', { name: project.title }).getAttribute('src')).toBe('/assets/images/canopy.png');
  card.focus();
  await user.keyboard('{Enter} ');
  expect(onOpen).toHaveBeenCalledTimes(2);
});
