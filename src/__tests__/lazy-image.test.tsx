// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import LazyImage from '../components/common/LazyImage';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('supplies the actual source to native lazy loading before any intersection', () => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {} disconnect() {} unobserve() {}
  });
  render(<LazyImage src="/fixtures/offscreen.png" alt="Offscreen fixture" />);
  const image = screen.getByRole('img') as HTMLImageElement;
  expect(image.getAttribute('src')).toBe('/fixtures/offscreen.png');
  expect(image.getAttribute('loading')).toBe('lazy');
});
