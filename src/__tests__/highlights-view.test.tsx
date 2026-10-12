// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import HighlightsView from '../components/highlights/HighlightsView';
import type { Project } from '../types';

const projects: Project[] = Array.from({ length: 6 }, (_, i) => ({
  title: `Configured fixture ${i}`, image: `fixtures/${i}.png`, category: 'personal',
  subcategory: null, description: 'Fixture description', fullDescription: 'Fixture details',
}));

function responses(config: unknown, failConfig = false) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: !(url.endsWith('highlights.json') && failConfig), status: failConfig ? 500 : 200,
    json: async () => url.endsWith('highlights.json') ? config : projects,
  })));
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('loads the configured tagline and five selectable cards with real image sources immediately', async () => {
  responses({ tagline: 'Editable fixture tagline', pool: projects.map((project) => project.image) });
  const user = userEvent.setup();
  const { container } = render(<HighlightsView />);
  await screen.findByText('Editable fixture tagline');
  await waitFor(() => expect(container.querySelectorAll('section img')).toHaveLength(5));
  for (const image of container.querySelectorAll('section img')) expect(image.getAttribute('src')).toMatch(/fixtures\//);
  const title = container.querySelector('section h2')!.textContent!;
  await user.click(screen.getByRole('button', { name: new RegExp(title) }));
  expect(screen.getByRole('dialog').textContent).toContain(title);
});

it.each([
  { config: { tagline: 'Empty fixture pool', pool: [] }, role: 'status' as const },
  { config: { tagline: 'Missing references', pool: ['missing.png'] }, role: 'status' as const },
  { config: { tagline: 42, pool: [] }, role: 'alert' as const },
  { config: { tagline: 'Invalid pool', pool: [false] }, role: 'alert' as const },
  { config: null, role: 'alert' as const },
])('settles to an accessible $role for unavailable or invalid config', async ({ config, role }) => {
  responses(config);
  const { container } = render(<HighlightsView />);
  expect((await screen.findByRole(role)).textContent).toBeTruthy();
  expect(container.querySelector('section')?.getAttribute('aria-busy')).toBe('false');
  expect((screen.getByRole('button', { name: 'Shuffle' }) as HTMLButtonElement).disabled).toBe(true);
});

it('reports config fetch errors without an endless loading state', async () => {
  responses({}, true);
  const { container } = render(<HighlightsView />);
  await screen.findByRole('alert');
  expect(container.querySelector('section')?.getAttribute('aria-busy')).toBe('false');
});
