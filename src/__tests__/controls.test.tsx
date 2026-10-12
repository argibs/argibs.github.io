// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import FilterDropdown from '../components/projects/FilterDropdown';
import CodingProjectRow from '../components/coding/CodingProjectRow';
import BaseModal from '../components/common/BaseModal';

afterEach(cleanup);

it('a modal-consumed Escape leaves the keyboard-open background filter disclosure intact', async () => {
  function Fixture() {
    const [open, setOpen] = useState(false);
    return <><FilterFixture /><button onClick={() => setOpen(true)}>Open fixture modal</button>
      <BaseModal open={open} onClose={() => setOpen(false)} label="Fixture modal"><button>Modal control</button></BaseModal></>;
  }
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole('button', { name: /GIS/ });
  trigger.focus();
  await user.keyboard('{Enter}');
  const opener = screen.getByRole('button', { name: 'Open fixture modal' });
  opener.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog')).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(opener);
});

function FilterFixture() {
  const [selected, setSelected] = useState<string | null>(null);
  return <><FilterDropdown label="GIS" options={['Maps', 'Analysis']} active selected={selected} onSelect={setSelected} /><output>{selected}</output></>;
}

it('filter options are absent when closed, activate via Enter/Space and Escape restores focus', async () => {
  const user = userEvent.setup();
  const { container } = render(<FilterFixture />);
  const trigger = screen.getByRole('button', { name: /GIS/ });
  expect(screen.queryByText('Maps')).toBeNull();
  for (const key of ['{Enter}', ' ']) {
    await user.click(trigger);
    const option = screen.getByRole('button', { name: 'Maps' });
    option.focus();
    await user.keyboard(key);
    expect(container.querySelector('output')?.textContent).toBe('Maps');
    expect(screen.queryByRole('button', { name: 'Maps' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  }
  await user.click(trigger);
  screen.getByRole('button', { name: 'Analysis' }).focus();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('button', { name: 'Analysis' })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('coding rows open from a native button with Enter and Space', async () => {
  const user = userEvent.setup();
  function Fixture() {
    const [count, setCount] = useState(0);
    return <><CodingProjectRow project={{ title: 'Example notebook', date: '2026', tags: ['Python'], description: 'Analysis', notebook: 'assets/coding_projects/example.ipynb' }} onOpen={() => setCount(count + 1)} /><output>{count}</output></>;
  }
  const { container } = render(<Fixture />);
  const button = screen.getByRole('button', { name: /Example notebook/ });
  button.focus();
  await user.keyboard('{Enter} ');
  expect(container.querySelector('output')?.textContent).toBe('2');
  expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
});
