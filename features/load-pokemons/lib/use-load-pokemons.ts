import { Pokemon } from "@/entities/pokemon";
import { fetchPokemons } from "@/entities/pokemon/api/pokemon-api";
import { pokemonKeys } from "@/shared/lib/query-keys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface LoadPokemonsState {
  loading: boolean;
  isNextPageLoading: boolean;
  error: string | null;
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
 * @param limit - Number of Pokemon to load per page (default: 10)
 */
export function useLoadPokemons(limit: number = 10) {
  const query = useInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: ({ pageParam }) => fetchPokemons(limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.length < limit ? undefined : lastPageParam + limit;
    },
  });

  const state = useMemo(
    () => ({
      loading: query.isLoading,
      isNextPageLoading: query.isFetchingNextPage,
      error: query.error?.message ?? null,
      pokemons: query.data?.pages.flat() ?? null,
      endOfItems: !query.hasNextPage,
    }),
    [
      query.isLoading,
      query.isFetchingNextPage,
      query.error,
      query.data,
      query.hasNextPage,
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
