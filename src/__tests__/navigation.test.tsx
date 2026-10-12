// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter, Link, MemoryRouter, Route, Routes, useNavigationType } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppLayout from '../components/layout/AppLayout';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

function ScrollNavigationControls() {
  const action = useNavigationType();
  return (
    <>
      <output data-navigation-action>{action}</output>
      <Link to="/" data-scroll-link="home">Home</Link>
      <Link to="/coding" replace data-scroll-link="replace">Replace with coding</Link>
      <Link to="/projects?view=maps" data-scroll-link="query">Change query</Link>
      <Link to="/projects#main-content" data-scroll-link="fragment">Jump to content</Link>
    </>
  );
}

async function renderBrowserRoute() {
  window.history.replaceState(null, '', '/projects');
  await act(async () => {
    root.render(
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="*" element={<ScrollNavigationControls />} />
          </Route>
        </Routes>
      </BrowserRouter>,
    );
  });
}

async function followScrollLink(name: string) {
  await act(async () => container.querySelector<HTMLAnchorElement>(`[data-scroll-link="${name}"]`)!.click());
}

async function traverseHistory(delta: number) {
  await act(async () => {
    const popped = new Promise<void>((resolve) => {
      window.addEventListener('popstate', () => resolve(), { once: true });
    });
    window.history.go(delta);
    await popped;
  });
}

describe('document scroll navigation policy', () => {
  it.each([
    { link: 'home', action: 'PUSH', pathname: '/' },
    { link: 'replace', action: 'REPLACE', pathname: '/coding' },
  ])('scrolls instantly to the top for a fresh $action path navigation', async ({ link, action, pathname }) => {
    await renderBrowserRoute();
    expect(window.scrollTo).not.toHaveBeenCalled();
    await followScrollLink(link);
    expect(window.location.pathname).toBe(pathname);
    expect(container.querySelector('[data-navigation-action]')?.textContent).toBe(action);
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('resets for a search-only URL navigation without resetting for disclosure changes', async () => {
    await renderBrowserRoute();
    await followScrollLink('query');
    expect(window.location.pathname).toBe('/projects');
    expect(window.location.search).toBe('?view=maps');
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' });
    vi.mocked(window.scrollTo).mockClear();
    await act(async () => menuControls().toggle.click());
    await act(async () => menuControls().toggle.click());
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('restores Back and Forward POP offsets after content is ready', async () => {
    await renderBrowserRoute();
    await followScrollLink('home');
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' });
    vi.mocked(window.scrollTo).mockClear();
    await traverseHistory(-1);
    await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
    expect(window.location.pathname).toBe('/projects');
    expect(container.querySelector('[data-navigation-action]')?.textContent).toBe('POP');
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' });
    vi.mocked(window.scrollTo).mockClear();
    await traverseHistory(1);
    await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
    expect(window.location.pathname).toBe('/');
    expect(container.querySelector('[data-navigation-action]')?.textContent).toBe('POP');
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('does not override fragment navigation with a top reset', async () => {
    await renderBrowserRoute();
    await followScrollLink('fragment');
    expect(window.location.hash).toBe('#main-content');
    expect(container.querySelector('[data-navigation-action]')?.textContent).toBe('PUSH');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

async function renderRoute(path: string) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="*" element={
              <>
                <h1>Page content</h1>
                <Link to="/coding" data-shortcut="coding">Coding shortcut</Link>
                <Link to="/projects" data-shortcut="projects">Projects shortcut</Link>
              </>
            } />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
}

function menuControls() {
  const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
  expect(toggle).not.toBeNull();
  const menuId = toggle.getAttribute('aria-controls');
  expect(menuId).toBeTruthy();
  const menu = document.getElementById(menuId!)!;
  expect(menu).not.toBeNull();
  return { toggle, menu };
}

describe('responsive navigation', () => {
  it.each(['/', '/highlights', '/projects', '/challenge', '/coding', '/webgis'])(
    'provides a compact home identity, closed disclosure, and skip target on %s',
    async (path) => {
      await renderRoute(path);
      const { toggle, menu } = menuControls();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(menu.hidden).toBe(true);
      expect(menu.getAttribute('aria-label')).toBeTruthy();
      expect(container.querySelector('header a[href="/"]')?.textContent).toContain('Ashton Gibson');
      expect(container.querySelector('a[href="#main-content"]')).not.toBeNull();
      expect(container.querySelector('main#main-content')?.getAttribute('tabindex')).toBe('-1');
    },
  );

  it('opens the menu and closes it with Escape, restoring focus to the trigger', async () => {
    await renderRoute('/projects');
    const { toggle, menu } = menuControls();
    await act(async () => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hidden).toBe(false);
    const link = menu.querySelector<HTMLAnchorElement>('a[href="/projects"]')!;
    expect(link.getAttribute('aria-current')).toBe('page');
    link.focus();
    await act(async () => {
      link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);
  });

  it('closes after navigation and updates the current-page link', async () => {
    await renderRoute('/projects');
    const { toggle, menu } = menuControls();
    await act(async () => toggle.click());
    await act(async () => menu.querySelector<HTMLAnchorElement>('a[href="/coding"]')!.click());
    const current = menuControls();
    expect(current.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(current.menu.hidden).toBe(true);
    expect(current.menu.querySelector('a[href="/coding"]')?.getAttribute('aria-current')).toBe('page');
    expect(current.menu.querySelector('a[href="/projects"]')?.hasAttribute('aria-current')).toBe(false);
  });

  it('also closes with Escape after focus moves from the menu to page content', async () => {
    await renderRoute('/projects');
    const { toggle, menu } = menuControls();
    await act(async () => toggle.click());
    const main = container.querySelector<HTMLElement>('main')!;
    main.focus();
    await act(async () => {
      main.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);
  });

  it('does not reopen when returning to a route after using a content link', async () => {
    await renderRoute('/projects');
    await act(async () => menuControls().toggle.click());
    await act(async () => container.querySelector<HTMLAnchorElement>('[data-shortcut="coding"]')!.click());
    expect(menuControls().menu.hidden).toBe(true);
    await act(async () => container.querySelector<HTMLAnchorElement>('[data-shortcut="projects"]')!.click());
    expect(menuControls().menu.hidden).toBe(true);
  });
});
