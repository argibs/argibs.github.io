import { describe, it, expect } from 'vitest';
import { deriveFilters, applyFilter } from '../utils/filters';
import type { Project } from '../types';

const fixtures: Project[] = [
  { category: 'coursework', subcategory: 'EAS 531', title: 'A', description: '', image: '', fullDescription: '' },
  { category: 'coursework', subcategory: 'EAS 531', title: 'B', description: '', image: '', fullDescription: '' },
  { category: 'coursework', subcategory: 'EAS 451', title: 'C', description: '', image: '', fullDescription: '' },
  { category: 'personal', subcategory: null, title: 'D', description: '', image: '', fullDescription: '' },
];

describe('deriveFilters', () => {
  it('returns unique categories with sorted subcategories', () => {
    const out = deriveFilters(fixtures);
    expect(out).toEqual([
      { category: 'coursework', subcategories: ['EAS 451', 'EAS 531'] },
      { category: 'personal', subcategories: [] },
    ]);
  });
});

describe('applyFilter', () => {
  it('returns all when no filter', () => {
    expect(applyFilter(fixtures, null, null)).toHaveLength(4);
  });
  it('filters by category', () => {
    expect(applyFilter(fixtures, 'personal', null)).toHaveLength(1);
  });
  it('filters by category + subcategory', () => {
    expect(applyFilter(fixtures, 'coursework', 'EAS 531')).toHaveLength(2);
  });
});
