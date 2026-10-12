// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import TopographicBackground from '../components/background/TopographicBackground';

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let paints: number;

function flushFrames() {
  const pending = [...frames.values()];
  frames.clear();
  act(() => pending.forEach((callback) => callback(0)));
}

beforeEach(() => {
  frames = new Map();
  frameId = 0;
  paints = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('innerWidth', 1440);
  vi.stubGlobal('innerHeight', 900);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: () => { paints++; },
    beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps the terrain decorative and defers its initial paint', () => {
  const { container } = render(<TopographicBackground />);
  expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  expect(paints).toBe(0);
  flushFrames();
  expect(paints).toBe(1);
});

it('bounds pixel work even on a large high-density viewport', () => {
  vi.stubGlobal('innerWidth', 7680);
  vi.stubGlobal('innerHeight', 4320);
  vi.stubGlobal('devicePixelRatio', 3);
  const { container } = render(<TopographicBackground />);
  flushFrames();
  const canvas = container.querySelector('canvas')!;
  expect(canvas.width * canvas.height).toBeLessThanOrEqual(480_000);
  expect(canvas.width / canvas.height).toBeCloseTo(7680 / 4320, 1);
  expect(paints).toBe(1);
});

it('coalesces resize bursts and renders the latest size only once', () => {
  const { container } = render(<TopographicBackground />);
  flushFrames();
  vi.stubGlobal('innerWidth', 390);
  act(() => {
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('resize'));
  });
  expect(paints).toBe(1);
  expect(frames.size).toBe(1);
  flushFrames();
  expect(paints).toBe(2);
  expect(container.querySelector('canvas')!.width).toBeLessThanOrEqual(390);
});

it('cancels scheduled work and removes resize listeners on unmount under Strict Mode', () => {
  const { unmount } = render(<StrictMode><TopographicBackground /></StrictMode>);
  expect(frames.size).toBe(1);
  flushFrames();
  expect(paints).toBe(1);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(frames.size).toBe(1);
  unmount();
  expect(frames.size).toBe(0);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(frames.size).toBe(0);
  flushFrames();
  expect(paints).toBe(1);
});

it('gracefully leaves a decorative fallback when canvas context is unavailable', () => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  const { container, unmount } = render(<TopographicBackground />);
  expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  act(() => window.dispatchEvent(new Event('resize')));
  expect(frames.size).toBe(0);
  expect(paints).toBe(0);
  expect(() => unmount()).not.toThrow();
});
