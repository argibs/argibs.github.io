import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

interface Offset { left: number; top: number }

function ensureBrowserEntryKey(): string {
  const state = window.history.state;
  if (typeof state?.key === 'string') return state.key;
  const key = window.crypto.randomUUID();
  // Native fragment entries have null state; retain Router metadata on other entries.
  window.history.replaceState({ idx: null, ...state, key }, '');
  return key;
}

export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const offsets = useRef(new Map<string, Offset>());

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const browserLocation = location.pathname === window.location.pathname
      && location.search === window.location.search && location.hash === window.location.hash;
    const key = browserLocation ? ensureBrowserEntryKey() : location.key;
    const saved = offsets.current.get(key);
    const main = document.getElementById('main-content');
    let pending = navigationType === 'POP' && saved !== undefined;
    let disposed = false;
    let frame = 0;
    let resize: ResizeObserver | undefined;
    let mutation: MutationObserver | undefined;

    const snapshot = () => {
      // Native anchor scrolling can happen before popstate/React's next commit.
      // Never assign that incoming entry's offset to the outgoing entry.
      if (browserLocation && window.history.state?.key !== key) return;
      if (!pending) offsets.current.set(key, { left: window.scrollX, top: window.scrollY });
    };
    const onPop = () => {
      snapshot();
      // Capture phase runs before BrowserRouter's popstate listener reconstructs
      // location.key, so a native fragment entry never aliases the default entry.
      if (browserLocation) ensureBrowserEntryKey();
    };
    const stop = () => {
      pending = false;
      cancelAnimationFrame(frame);
      frame = 0;
      resize?.disconnect();
      mutation?.disconnect();
    };
    const attempt = () => {
      frame = 0;
      if (disposed || !pending || !saved) return;
      const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const maxLeft = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      const ready = !main?.querySelector('[aria-busy="true"]');
      if (!ready && (maxTop < saved.top || maxLeft < saved.left)) return;
      // Once loading has settled, changed content may legitimately be shorter.
      stop();
      window.scrollTo({ top: Math.min(saved.top, maxTop), left: Math.min(saved.left, maxLeft), behavior: 'instant' });
      snapshot();
    };
    const schedule = () => {
      if (!disposed && pending && !frame) frame = requestAnimationFrame(attempt);
    };
    const interact = () => {
      if (pending) stop();
      snapshot();
    };

    if (pending) {
      resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
      resize?.observe(document.documentElement);
      if (main) {
        resize?.observe(main);
        mutation = new MutationObserver(schedule);
        mutation.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
      }
      schedule();
    } else {
      if (navigationType !== 'POP' && !location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      snapshot();
    }

    window.addEventListener('scroll', snapshot, { passive: true });
    window.addEventListener('resize', schedule);
    // Capture outgoing offsets before React replaces tall content with loading UI.
    // Do not sample during effect cleanup: the DOM may already have shrunk then.
    window.addEventListener('popstate', onPop, true);
    document.addEventListener('click', interact, true);
    document.addEventListener('keydown', interact, true);
    document.addEventListener('pointerdown', interact, true);
    document.addEventListener('touchstart', interact, { capture: true, passive: true });
    document.addEventListener('wheel', interact, { capture: true, passive: true });
    return () => {
      disposed = true;
      stop();
      window.removeEventListener('scroll', snapshot);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('popstate', onPop, true);
      document.removeEventListener('click', interact, true);
      document.removeEventListener('keydown', interact, true);
      document.removeEventListener('pointerdown', interact, true);
      document.removeEventListener('touchstart', interact, true);
      document.removeEventListener('wheel', interact, true);
    };
  }, [location.key, location.pathname, location.search, location.hash, navigationType]);
}
