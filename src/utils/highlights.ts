import type { HighlightsConfig, Project } from '../types';

export function isHighlightsConfig(value: unknown): value is HighlightsConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Partial<HighlightsConfig>;
  return typeof config.tagline === 'string' && Array.isArray(config.pool)
    && config.pool.every((image) => typeof image === 'string' && image.trim().length > 0);
}

export function pickHighlights(data: readonly Project[], pool: readonly string[], random = Math.random): Project[] {
  const byImage = new Map<string, Project>();
  for (const project of data) {
    if (!byImage.has(project.image)) byImage.set(project.image, project);
  }
  const shuffled: Project[] = [];
  for (const image of new Set(pool)) {
    const project = byImage.get(image);
    if (project) shuffled.push(project);
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}
