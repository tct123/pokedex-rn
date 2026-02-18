import { Pokemon, PokemonPreview } from "@/entities/pokemon";
import { fetchPokemon } from "@/entities/pokemon/api/pokemon-api";
import { pokemonKeys } from "@/shared/lib/query-keys";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

interface LoadPokemonsState {
  loading: boolean;
  isNextPageLoading: boolean;
  error: string | null;
  isFirstPageError: boolean;
  pokemons: Pokemon[] | null;
  endOfItems: boolean;
}

interface LoadPokemonsAction {
  fetchNextPage: () => void;
}

export interface LoadPokemonsResult {
  state: LoadPokemonsState;
  actions: LoadPokemonsAction;
}

/**
 * Hook for loading Pokemon data with pagination using React Query.
 *
 * @param previews - Full directory of Pokemon previews (used as ID source for pagination)
 * @param limit - Number of Pokemon to load per page (default: 30)
 */
export function useLoadPokemons(previews: PokemonPreview[] | null, limit: number = 30) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const page = previews!.slice(pageParam, pageParam + limit);
      const pokemons = await Promise.all(
        page.map(async (preview) => {
          const pokemon = await fetchPokemon(preview.id);
          queryClient.setQueryData(pokemonKeys.detail(preview.id), pokemon);
          return pokemon;
        })
      );
      return pokemons;
    },
    enabled: previews !== null,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.length < limit ? undefined : lastPageParam + limit;
    },
  });

  const hasData = (query.data?.pages[0]?.length ?? 0) > 0;

  const state = useMemo(
    () => ({
      loading: query.isLoading || previews === null,
      isNextPageLoading: query.isFetchingNextPage,
      error: query.error?.message ?? null,
      isFirstPageError: !!query.error && !hasData,
      pokemons: query.data?.pages.flat() ?? null,
      endOfItems: !query.hasNextPage,
    }),
    [
      query.isLoading,
      query.isFetchingNextPage,
      query.error,
      query.data,
      query.hasNextPage,
      hasData,
      previews,
    ]
  );

  const actions = useMemo(
    () => ({
      fetchNextPage: () => {
        query.fetchNextPage();
      },
    }),
    [query]
  );

  return {
    state,
    actions,
  } as LoadPokemonsResult;
}
