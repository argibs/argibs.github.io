// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useState } from 'react';
import NotebookViewer from '../components/coding/NotebookViewer';
import BaseModal from '../components/common/BaseModal';
import CodingProjectsView from '../components/coding/CodingProjectsView';

const preview = '<!doctype html><html><head><meta name="portfolio-notebook-preview" content="1"></head><body>Saved output</body></html>';
beforeEach(() => {
  // Mock only the static file HTTP boundary; the iframe and message handler are real.
  vi.stubGlobal('fetch', vi.fn(async () => new Response(preview, { headers: { 'Content-Type': 'text/html' } })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function Fixture() {
  const [open, setOpen] = useState(true);
  return <BaseModal open={open} onClose={() => setOpen(false)} label="Example notebook">
    <NotebookViewer notebookPath="assets/coding_projects/example.ipynb" title="Example notebook" />
  </BaseModal>;
}

it('loads a local sandboxed lazy iframe, announces progress and preserves the original download', async () => {
  render(<Fixture />);
  expect(screen.getByRole('status').textContent).toContain('Loading');
  const download = screen.getByRole('link', { name: /Download original notebook/ });
  expect(download.getAttribute('href')).toBe('/assets/coding_projects/example.ipynb');
  expect(download.hasAttribute('download')).toBe(true);
  const iframe = await screen.findByTitle('Example notebook \u2014 saved notebook preview') as HTMLIFrameElement;
  expect(iframe.getAttribute('src')).toBe('/notebook-previews/assets/coding_projects/example.html');
  expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
  expect(iframe.getAttribute('loading')).toBe('lazy');
  fireEvent(window, new MessageEvent('message', { data: { type: 'portfolio-notebook-ready' }, source: iframe.contentWindow }));
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
});

it('ignores forged and unrelated iframe messages and closes only for Escape from its actual contentWindow', async () => {
  render(<Fixture />);
  const iframe = await screen.findByTitle('Example notebook \u2014 saved notebook preview') as HTMLIFrameElement;
  fireEvent(window, new MessageEvent('message', { data: { type: 'portfolio-notebook-escape' }, source: window }));
  fireEvent(window, new MessageEvent('message', { data: { type: 'unknown' }, source: iframe.contentWindow }));
  fireEvent(window, new MessageEvent('message', { data: null, source: iframe.contentWindow }));
  expect(screen.getByRole('dialog', { name: 'Example notebook' })).toBeTruthy();
  fireEvent(window, new MessageEvent('message', { data: { type: 'portfolio-notebook-escape' }, source: iframe.contentWindow }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('reports missing previews, retries and rejects a successful SPA fallback document', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response('Missing', { status: 404 }))
    .mockResolvedValueOnce(new Response('<!doctype html><div id="root"></div>', { status: 200 }));
  const user = userEvent.setup();
  render(<Fixture />);
  expect((await screen.findByRole('alert')).textContent).toContain('Could not load');
  expect(screen.queryByTitle('Example notebook \u2014 saved notebook preview')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Retry preview' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Could not load');
  await user.click(screen.getByRole('button', { name: 'Retry preview' }));
  expect(await screen.findByTitle('Example notebook \u2014 saved notebook preview')).toBeTruthy();
});

it('opens authentic saved-image messages in the real coding Lightbox, rejects unsafe/foreign payloads, and Escape preserves the notebook', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify([{ title: 'Example notebook', date: '2026', tags: ['Python'], description: 'Analysis', notebook: 'assets/coding_projects/example.ipynb' }])));
  const user = userEvent.setup();
  render(<CodingProjectsView />);
  await user.click(await screen.findByRole('button', { name: /Example notebook/ }));
  const iframe = await screen.findByTitle('Example notebook \u2014 saved notebook preview') as HTMLIFrameElement;
  const send = (src: unknown, source: Window | null = iframe.contentWindow) => fireEvent(window, new MessageEvent('message', { source, data: { type: 'portfolio-notebook-image', src, alt: 'Saved map' } }));
  send('data:image/png;base64,AA==', window);
  for (const invalid of [null, 42, 'https://evil.example/image.png', 'data:image/svg+xml;base64,AA==', 'data:text/html;base64,AA==', 'data:image/png;base64,<script>', 'data:image/jpeg;base64,']) send(invalid);
  expect(screen.queryByRole('dialog', { name: 'Image preview: Saved map' })).toBeNull();
  for (const src of ['data:image/png;base64,AA==', 'data:image/jpeg;base64,/9j/AA==']) {
    iframe.focus();
    send(src);
    expect(screen.getByRole('dialog', { name: 'Image preview: Saved map' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Saved map' }).getAttribute('src')).toBe(src);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Image preview: Saved map' })).toBeNull());
    expect(screen.getByRole('dialog', { name: 'Example notebook' })).toBeTruthy();
    expect(document.activeElement).toBe(iframe);
  }
  fireEvent(window, new MessageEvent('message', { data: { type: 'portfolio-notebook-escape' }, source: iframe.contentWindow }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
