import type { Project } from '../types';

export interface FilterOption {
  category: string;
  subcategories: string[];
}

export function deriveFilters(projects: Project[]): FilterOption[] {
  const map = new Map<string, Set<string>>();
  for (const p of projects) {
    if (!map.has(p.category)) map.set(p.category, new Set());
    if (p.subcategory) map.get(p.category)!.add(p.subcategory);
  }
  return Array.from(map.entries()).map(([category, subs]) => ({
    category,
    subcategories: Array.from(subs).sort(),
  }));
}

export function applyFilter(
  projects: Project[],
  category: string | null,
  subcategory: string | null,
): Project[] {
  return projects.filter((p) => {
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });
}
