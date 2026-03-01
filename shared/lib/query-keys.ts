export const pokemonKeys = {
  all: ['pokemons'] as const,
  lists: (params?: object) => [...pokemonKeys.all, 'list', params ?? 'all'] as const,
  details: () => [...pokemonKeys.all, 'detail'] as const,
  detail: (id: string) => [...pokemonKeys.details(), id] as const,
};
