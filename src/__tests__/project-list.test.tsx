// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ProjectsSection from '../components/projects/ProjectsSection';
import type { Project } from '../types';

const fixtures: Project[] = Array.from({ length: 8 }, (_, i) => ({
  title: `List fixture ${i}`, image: `fixtures/${i}.png`, category: 'personal', subcategory: null,
  description: 'Fixture description', fullDescription: 'Fixture details',
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('renders every returned project and source immediately, with a count and only a truthful scroll cue', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => fixtures })));
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  let bottom = 2400;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    top: 0, left: 0, right: 300, bottom, width: 300, height: bottom, x: 0, y: 0, toJSON() {},
  }));
  const { container } = render(<ProjectsSection />);
  await screen.findByText('8 projects');
  expect(container.querySelectorAll('section img')).toHaveLength(8);
  expect(screen.getByRole('button', { name: /List fixture 7/ })).toBeTruthy();
  for (const image of container.querySelectorAll('section img')) expect(image.getAttribute('src')).toMatch(/fixtures\//);
  await screen.findByText(/Scroll to see more/);
  bottom = 200;
  await act(async () => window.dispatchEvent(new Event('resize')));
  await waitFor(() => expect(screen.queryByText(/Scroll to see more/)).toBeNull());
});
