// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import ProjectModal from '../components/projects/ProjectModal';
import ChallengeModal from '../components/challenge/ChallengeModal';

afterEach(cleanup);

it.each(['project', 'challenge'])('%s image expansion is a keyboard-accessible named button', async (kind) => {
  function Fixture() {
    const [src, setSrc] = useState('');
    return <>
      {kind === 'project' ? <ProjectModal project={{ title: 'Example map', category: 'GIS', subcategory: null, fullDescription: 'Map details', image: 'assets/images/example.png', description: 'Map' }} onClose={() => {}} onImageClick={setSrc} /> : <ChallengeModal day={{ day: 1, title: 'Example map', fullDescription: 'Map details', image: 'assets/images/example.png', description: 'Map' }} onClose={() => {}} onImageClick={setSrc} />}
      <output>{src}</output>
    </>;
  }
  const user = userEvent.setup();
  render(<Fixture />);
  const button = screen.getByRole('button', { name: /Expand.*Example map/ });
  button.focus();
  await user.keyboard('{Enter}');
  expect(document.querySelector('output')?.textContent).toContain('assets/images/example.png');
});
