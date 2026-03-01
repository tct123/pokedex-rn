export interface PokemonFilters {
  types: string[];
  weaknesses: string[];
  heights: string[];
  weights: string[];
  numberRange: [number, number];
}

export const DEFAULT_FILTERS: PokemonFilters = {
  types: [],
  weaknesses: [],
  heights: [],
  weights: [],
  numberRange: [1, 1100],
};

export function computeHasActiveFilters(filters: PokemonFilters): boolean {
  return (
    filters.types.length > 0 ||
    filters.weaknesses.length > 0 ||
    filters.heights.length > 0 ||
    filters.weights.length > 0 ||
    filters.numberRange[0] !== DEFAULT_FILTERS.numberRange[0] ||
    filters.numberRange[1] !== DEFAULT_FILTERS.numberRange[1]
  );
}
