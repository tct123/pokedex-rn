import { Pokemon } from "@/entities/pokemon";
import { fetchPokemons, PokemonListParams } from "@/entities/pokemon/api/pokemon-api";
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
  refetch: () => void;
}

export interface LoadPokemonsResult {
  state: LoadPokemonsState;
  actions: LoadPokemonsAction;
}

type ApiParams = Omit<PokemonListParams, "limit" | "offset">;

interface UseLoadPokemonsOptions {
  limit?: number;
  apiParams?: ApiParams;
}

export function useLoadPokemons({ limit = 30, apiParams = {} }: UseLoadPokemonsOptions = {}) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: pokemonKeys.lists(apiParams),
    queryFn: async ({ pageParam }) => {
      const pokemons = await fetchPokemons({ ...apiParams, limit, offset: pageParam });
      pokemons.forEach((pokemon: Pokemon) => {
        queryClient.setQueryData(pokemonKeys.detail(pokemon.id), pokemon);
      });
      return pokemons;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.length < limit ? undefined : lastPageParam + limit;
    },
  });

  const hasData = (query.data?.pages[0]?.length ?? 0) > 0;

  const state = useMemo(
    () => ({
      loading: query.isLoading,
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
    ]
  );

  const { fetchNextPage, refetch } = query;
  const actions = useMemo(
    () => ({
      fetchNextPage: () => {
        fetchNextPage();
      },
      refetch: () => {
        refetch();
      },
    }),
    [fetchNextPage, refetch]
  );

  return {
    state,
    actions,
  } as LoadPokemonsResult;
}
