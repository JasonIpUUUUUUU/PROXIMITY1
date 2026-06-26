import {CATEGORY_KEYWORDS} from '../utils/constants';
import {Place} from '../models/Place';

export interface FilterState {
  categories: string[];
  showMarkedOnly: boolean;
  searchQuery: string;
}

export class FilterLogic {
  private filters: FilterState = {
    categories: [],
    showMarkedOnly: false,
    searchQuery: '',
  };

  setCategoryFilter(categories: string[]): void {
    this.filters.categories = categories;
  }

  setMarkedFilter(showMarked: boolean): void {
    this.filters.showMarkedOnly = showMarked;
  }

  setSearchQuery(query: string): void {
    this.filters.searchQuery = query.toLowerCase().trim();
  }

  getMatchedCategories(query: string): string[] {
    if (!query) {
      return [];
    }

    const matched: string[] = [];
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => kw.includes(query) || query.includes(kw))) {
        matched.push(category);
      }
    }
    return matched;
  }

  applyFilters(places: Place[], markedPlaceIds: number[] = []): Place[] {
    let filtered = [...places];

    if (this.filters.searchQuery) {
      const matchedCategories = this.getMatchedCategories(this.filters.searchQuery);

      if (matchedCategories.length > 0) {
        filtered = filtered.filter(
          place => matchedCategories.includes(place.category) || markedPlaceIds.includes(place.id),
        );
      } else {
        filtered = filtered.filter(place => markedPlaceIds.includes(place.id));
      }
    }

    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(place => this.filters.categories.includes(place.category));
    }

    if (this.filters.showMarkedOnly) {
      filtered = filtered.filter(place => markedPlaceIds.includes(place.id));
    }

    return filtered;
  }

  hasActiveFilters(): boolean {
    return (
      this.filters.searchQuery.length > 0 ||
      this.filters.categories.length > 0 ||
      this.filters.showMarkedOnly
    );
  }

  resetFilters(): void {
    this.filters = {
      categories: [],
      showMarkedOnly: false,
      searchQuery: '',
    };
  }

  getSearchHint(filteredCount: number, matchedCategories: string[] = []): string {
    if (!this.filters.searchQuery) {
      return 'Search a category to discover places near you';
    }

    if (filteredCount === 0) {
      return 'No match — try: bar, pub, or quick munch';
    }

    const catLabel = matchedCategories.map(c => c.replace('_', ' ')).join(' & ');
    return `${filteredCount} ${catLabel} place${
      filteredCount !== 1 ? 's' : ''
    } found — tap a bubble to explore`;
  }

  getCurrentFilters(): FilterState {
    return {...this.filters};
  }
}

export default FilterLogic;
