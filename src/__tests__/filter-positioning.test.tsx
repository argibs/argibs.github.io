// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import FilterDropdown from '../components/projects/FilterDropdown';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('positions using the actual seven-row height and recomputes viewport-constrained scrolling on resize and scroll', async () => {
  let top = 100;
  let bottom = 140;
  vi.stubGlobal('innerHeight', 420);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute('aria-label') ? new DOMRect(0, bottom, 200, 308) : new DOMRect(0, top, 200, bottom - top);
  });
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(308);
  const user = userEvent.setup();
  render(<FilterDropdown label="GIS" options={['One', 'Two', 'Three', 'Four', 'Five', 'Six']} selected={null} active={false} onSelect={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'GIS' }));
  const menu = document.getElementById(screen.getByRole('button', { name: 'GIS' }).getAttribute('aria-controls')!)!;
  // 308px does not fit below (266px), despite the old 240px heuristic.
  expect(menu.style.maxHeight).toBe('266px');
  expect(menu.style.overflowY).toBe('auto');
  vi.stubGlobal('innerHeight', 730);
  top = 400;
  bottom = 450;
  fireEvent(window, new Event('scroll'));
  expect(menu.style.bottom).toBe('calc(100% + 6px)');
  expect(menu.style.top).toBe('auto');
  expect(menu.style.maxHeight).toBe('386px');
  vi.stubGlobal('innerHeight', 250);
  top = 100;
  bottom = 140;
  fireEvent(window, new Event('resize'));
  expect(menu.style.maxHeight).toBe('96px');
  expect(menu.style.top).toBe('calc(100% + 6px)');
  expect(screen.getByRole('button', { name: 'Six' })).toBeTruthy();
});
