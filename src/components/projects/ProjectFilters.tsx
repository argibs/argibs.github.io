import type { FilterOption } from '../../utils/filters';
import FilterDropdown from './FilterDropdown';
import styles from './ProjectFilters.module.css';

interface Props {
  filters: FilterOption[];
  activeCategory: string | null;
  activeSubcategory: string | null;
  onChange: (category: string | null, subcategory: string | null) => void;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Mirrors script.js buildFilters (680-823):
 *   - "All Projects" chip at the start (active when nothing selected)
 *   - Simple <button class="filter-btn"> for categories without subcategories
 *   - Compound <div class="filter-dropdown-wrapper"> for categories with subcategories
 */
export default function ProjectFilters({
  filters,
  activeCategory,
  activeSubcategory,
  onChange,
}: Props) {
  const allActive = activeCategory === null && activeSubcategory === null;
  return (
    <div className={styles.filters}>
      <button
        type="button"
        className={`${styles.btn} ${allActive ? styles.active : ''}`}
        onClick={() => onChange(null, null)}
      >
        All Projects
      </button>
      {filters.map((f) => {
        const isActive = activeCategory === f.category;
        if (!f.subcategories || f.subcategories.length === 0) {
          return (
            <button
              key={f.category}
              type="button"
              className={`${styles.btn} ${isActive ? styles.active : ''}`}
              onClick={() => onChange(f.category, null)}
            >
              {capitalize(f.category)}
            </button>
          );
        }
        return (
          <FilterDropdown
            key={f.category}
            label={capitalize(f.category)}
            options={f.subcategories}
            selected={isActive ? activeSubcategory : null}
            active={isActive}
            onSelect={(sub) => onChange(f.category, sub)}
          />
        );
      })}
    </div>
  );
}
