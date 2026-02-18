export const pokemonKeys = {
  all: ['pokemons'] as const,
  lists: () => [...pokemonKeys.all, 'list'] as const,
  directory: () => [...pokemonKeys.all, 'directory'] as const,
  details: () => [...pokemonKeys.all, 'detail'] as const,
  detail: (id: string) => [...pokemonKeys.details(), id] as const,
  search: (query: string) => [...pokemonKeys.all, 'search', query] as const,
};
