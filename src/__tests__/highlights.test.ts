import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { pickHighlights } from '../utils/highlights';

const projects: Project[] = Array.from({ length: 7 }, (_, i) => ({
  title: `Fixture ${i}`, category: 'personal', subcategory: null,
  description: 'Fixture description', fullDescription: 'Fixture details', image: `fixtures/${i}.png`,
}));
const pool = projects.map((project) => project.image);

describe('configured Highlights selection', () => {
  it('resolves image references beyond the first fifteen regardless of category or renamed titles', () => {
    const renamed = { ...projects[6], title: 'Renamed fixture', subcategory: 'Other course' };
    const unconfigured = Array.from({ length: 20 }, (_, i) => ({ ...projects[0], image: `unconfigured/${i}.png` }));
    expect(pickHighlights([...unconfigured, renamed], [renamed.image], () => 0)).toEqual([renamed]);
  });

  it('deduplicates references and candidates and ignores unavailable references', () => {
    expect(pickHighlights([...projects, { ...projects[0], title: 'Duplicate image' }],
      ['missing.png', pool[0], pool[0], pool[1]], () => 0.999)).toEqual([projects[0], projects[1]]);
  });

  it('selects up to five unique projects with Fisher-Yates draws', () => {
    expect(pickHighlights(projects, pool, () => 0)).toEqual(projects.slice(1, 6));
    expect(pickHighlights(projects, pool, () => 0.999)).toEqual(projects.slice(0, 5));
  });

  it('handles small, empty and unavailable pools without unnecessary draws', () => {
    const unexpectedDraw = () => { throw new Error('No draw needed'); };
    expect(pickHighlights(projects, [pool[2]], unexpectedDraw)).toEqual([projects[2]]);
    expect(pickHighlights(projects, [], unexpectedDraw)).toEqual([]);
    expect(pickHighlights([], pool, unexpectedDraw)).toEqual([]);
    expect(pickHighlights(projects, ['unavailable.png'], unexpectedDraw)).toEqual([]);
  });

  it('does not mutate either input or source records', () => {
    const source = Object.freeze(projects.map((project) => Object.freeze({ ...project })));
    const references = Object.freeze([...pool]);
    const before = JSON.stringify([source, references]);
    pickHighlights(source, references, () => 0);
    expect(JSON.stringify([source, references])).toBe(before);
  });
});
