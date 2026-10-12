// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import BaseModal from '../components/common/BaseModal';
import Lightbox from '../components/common/Lightbox';

afterEach(cleanup);

function DialogFixture() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(false);
  return <>
    <button onClick={() => setOpen(true)}>Open project</button>
    <button>Background action</button>
    <BaseModal open={open} onClose={() => setOpen(false)} labelledBy="fixture-title">
      <h2 id="fixture-title">Example project</h2>
      <button onClick={() => setImage(true)}>Expand map</button>
    </BaseModal>
    <Lightbox src={image ? 'data:image/png;base64,AA==' : null} onClose={() => setImage(false)} />
  </>;
}

describe('modal interaction', () => {
  it('moves focus inside, traps Tab, hides background and restores the invoking button', async () => {
    const user = userEvent.setup();
    render(<DialogFixture />);
    const trigger = screen.getByRole('button', { name: 'Open project' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Example project' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.queryByRole('button', { name: 'Background action' })).toBeNull();
    screen.getByRole('button', { name: 'Expand map' }).focus();
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape closes only the topmost image and restores the lower dialog control', async () => {
    const user = userEvent.setup();
    render(<DialogFixture />);
    await user.click(screen.getByRole('button', { name: 'Open project' }));
    const expand = screen.getByRole('button', { name: 'Expand map' });
    await user.click(expand);
    expect(screen.queryByRole('button', { name: 'Expand map' })).toBeNull();
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby') || screen.getByRole('dialog').getAttribute('aria-label')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelectorAll('[role="dialog"]').length).toBe(1));
    expect(screen.getByRole('dialog', { name: 'Example project' })).toBeTruthy();
    expect(document.activeElement).toBe(expand);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
  });

  it('a rapid Escape during Radix layer handoff closes the new image, never its parent', async () => {
    const user = userEvent.setup();
    render(<DialogFixture />);
    const trigger = screen.getByRole('button', { name: 'Open project' });
    await user.click(trigger);
    const expand = screen.getByRole('button', { name: 'Expand map' });
    let sent = false;
    const escapeDuringHandoff = () => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      if (dialogs.length !== 2 || sent) return;
      sent = true;
      // Characterize the installed Radix version's confirmed listener-handoff gap:
      // the new Content exists, while the parent's capture listener is still active.
      dialogs[1].querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', bubbles: true, cancelable: true,
      }));
    };
    document.addEventListener('dismissableLayer.update', escapeDuringHandoff, true);
    try {
      await user.click(expand);
      await waitFor(() => expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1));
      expect(screen.getByRole('dialog', { name: 'Example project' })).toBeTruthy();
      expect(document.activeElement).toBe(expand);
    } finally {
      document.removeEventListener('dismissableLayer.update', escapeDuringHandoff, true);
    }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('an already-consumed Escape during layer handoff does not dismiss either dialog', async () => {
    const user = userEvent.setup();
    render(<DialogFixture />);
    await user.click(screen.getByRole('button', { name: 'Open project' }));
    let sent = false;
    const consumedEscape = () => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      if (dialogs.length !== 2 || sent) return;
      sent = true;
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      event.preventDefault();
      dialogs[1].dispatchEvent(event);
    };
    document.addEventListener('dismissableLayer.update', consumedEscape, true);
    try {
      await user.click(screen.getByRole('button', { name: 'Expand map' }));
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
      expect(document.getElementById('fixture-title')).not.toBeNull();
      expect(screen.getByRole('dialog', { name: /Image preview:/ })).toBeTruthy();
    } finally {
      document.removeEventListener('dismissableLayer.update', consumedEscape, true);
    }
  });

  it('releases modal locks when unmounted while open', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DialogFixture />);
    await user.click(screen.getByRole('button', { name: 'Open project' }));
    await user.click(screen.getByRole('button', { name: 'Expand map' }));
    unmount();
    await waitFor(() => expect(document.body.hasAttribute('data-scroll-locked')).toBe(false));
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.body.style.pointerEvents).not.toBe('none');
  });
});
