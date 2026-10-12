// @vitest-environment jsdom
import { useLayoutEffect } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AppLayout from '../components/layout/AppLayout';
import ProjectsSection from '../components/projects/ProjectsSection';

let y = 0;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let responses: (() => void)[];
let readyHeight: number;
let resizeCallbacks: ResizeObserverCallback[];
let disconnected: number;

beforeEach(() => {
  frames = new Map(); nextFrame = 0; responses = []; resizeCallbacks = []; disconnected = 0;
  y = 0; readyHeight = 4000;
  window.history.replaceState(null, '', '/projects');
  Object.defineProperty(window.history, 'scrollRestoration', { configurable: true, writable: true, value: 'auto' });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++nextFrame; frames.set(id, callback); return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
    observe() {} disconnect() { disconnected++; }
  });
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.spyOn(window, 'scrollX', 'get').mockReturnValue(0);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockImplementation(() => {
    if (window.location.pathname !== '/projects') return 1200;
    return document.querySelector('[aria-busy="true"]') ? 600 : readyHeight;
  });
  vi.spyOn(document.documentElement, 'scrollWidth', 'get').mockReturnValue(1024);
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
  vi.spyOn(window, 'scrollTo').mockImplementation((options) => {
    y = Math.min(Math.max(0, document.documentElement.scrollHeight - 600), (options as ScrollToOptions).top ?? 0);
    window.dispatchEvent(new Event('scroll'));
  });
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => responses.push(() => resolve({
    ok: true, json: async () => [{ title: 'Scroll fixture', category: 'personal', subcategory: null,
      image: 'fixtures/map.png', description: 'Fixture', fullDescription: 'Details' }],
  })))));
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/'); });

function Fixture() {
  const location = useLocation();
  useLayoutEffect(() => {
    // Emulate the browser clamping an outgoing offset when the loading page shrinks.
    y = Math.min(y, document.documentElement.scrollHeight - 600);
  }, [location.key]);
  return <><Link to="/">Fixture home</Link><Link to="/projects" replace={false}>Fixture projects</Link>
    <Link to="/projects" replace>Fixture replace</Link><Link to="/projects#main-content">Fixture fragment</Link>
    {location.pathname === '/projects' ? <ProjectsSection key={location.key} /> : <h1>Fixture home page</h1>}</>;
}

async function mount() {
  render(<BrowserRouter><Routes><Route element={<AppLayout />}><Route path="*" element={<Fixture />} /></Route></Routes></BrowserRouter>);
  await settle();
}

async function settle() {
  await act(async () => {
    const pending = [...frames.values()]; frames.clear();
    for (const callback of pending) callback(0);
  });
}

async function load() {
  await act(async () => responses.shift()!());
  await settle();
}

async function scrollTo(yOffset: number) {
  await act(async () => { y = yOffset; window.dispatchEvent(new Event('scroll')); });
}

async function follow(name: string) {
  await act(async () => screen.getByRole('link', { name }).click());
  await settle();
}

async function traverse(delta: number) {
  await act(async () => {
    const popped = new Promise<void>((resolve) => window.addEventListener('popstate', () => resolve(), { once: true }));
    window.history.go(delta); await popped;
  });
  await settle();
}

async function nativeFragment() {
  await act(async () => {
    const popped = new Promise<void>((resolve) => window.addEventListener('popstate', () => resolve(), { once: true }));
    screen.getByRole('link', { name: 'Skip to content' }).click();
    await popped;
  });
  await settle();
  // The keyed fixture can refetch when BrowserRouter learns a new entry identity.
  if (responses.length) await load();
}

it('restores a saved fragment-entry POP offset after its deferred response', async () => {
  await mount(); await load();
  await follow('Fixture fragment'); await load(); await scrollTo(900);
  await follow('Fixture home'); await traverse(-1);
  expect(window.location.hash).toBe('#main-content');
  expect(y).toBe(0);
  await load(); expect(y).toBe(900);
});

it('keeps the original default entry and a native skip-link entry independent on Back and Forward', async () => {
  await mount(); await load(); await scrollTo(1200);
  await nativeFragment(); await scrollTo(900);
  await follow('Fixture home');
  expect(Number.isFinite(window.history.state.idx)).toBe(true);
  await traverse(-1); await load(); expect(y).toBe(900);
  await traverse(-1);
  if (responses.length) await load();
  expect(window.location.hash).toBe('');
  expect(y).toBe(1200);
  await traverse(1);
  if (responses.length) await load();
  expect(y).toBe(900);
});

it('restores Back after delayed content, and Forward to its own history-entry offset', async () => {
  await mount(); await load(); await scrollTo(1600);
  await follow('Fixture home'); expect(y).toBe(0);
  await scrollTo(300);
  await traverse(-1); expect(y).toBe(0);
  await load(); expect(y).toBe(1600);
  await traverse(1); expect(y).toBe(300);
});

it('keeps distinct offsets for repeated entries of the same route', async () => {
  await mount(); await load(); await scrollTo(1700);
  await follow('Fixture projects'); await load(); await scrollTo(900);
  await follow('Fixture home');
  await traverse(-1); await load(); expect(y).toBe(900);
  await traverse(-1); await load(); expect(y).toBe(1700);
  await traverse(1); await load(); expect(y).toBe(900);
});

it('clamps only once a shorter response is ready', async () => {
  await mount(); await load(); await scrollTo(1800); await follow('Fixture home');
  await traverse(-1); expect(y).toBe(0);
  readyHeight = 1100;
  await load(); expect(y).toBe(500);
});

it.each(['wheel', 'touchstart', 'pointerdown', 'keydown'])('cancels pending restoration on %s interaction', async (type) => {
  await mount(); await load(); await scrollTo(1800); await follow('Fixture home'); await traverse(-1);
  await act(async () => document.dispatchEvent(type === 'keydown' ? new KeyboardEvent(type, { key: 'PageDown' }) : new Event(type)));
  await load(); expect(y).toBe(0);
});

it('fresh REPLACE resets instantly and fragments are not overridden', async () => {
  await mount(); await load(); await scrollTo(800);
  await follow('Fixture replace'); expect(y).toBe(0); await load(); await scrollTo(800);
  vi.mocked(window.scrollTo).mockClear();
  await follow('Fixture fragment'); await load();
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it('disconnects pending work and restores the prior browser policy on unmount', async () => {
  await mount(); await load(); await scrollTo(1800); await follow('Fixture home'); await traverse(-1);
  expect(window.history.scrollRestoration).toBe('manual');
  cleanup();
  expect(window.history.scrollRestoration).toBe('auto');
  expect(frames.size).toBe(0);
  expect(disconnected).toBeGreaterThan(0);
  vi.mocked(window.scrollTo).mockClear();
  for (const callback of resizeCallbacks) callback([], {} as ResizeObserver);
  await settle();
  expect(window.scrollTo).not.toHaveBeenCalled();
});
