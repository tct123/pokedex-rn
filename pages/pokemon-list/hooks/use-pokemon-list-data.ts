import { Pokemon } from "@/entities/pokemon";
import { useMemo } from "react";
import { usePokemonListContext } from "../context/pokemon-list-context";

export type ListItem =
  | { id: string; type: "search" }
  | { id: string; type: "empty" }
  | { id: string; type: "error" }
  | { id: string; type: "loading" }
  | { id: string; type: "pokemon"; data: Pokemon };

export function usePokemonListData() {
  const { loadPokemonsState, searchState } = usePokemonListContext();

  const displayPokemons = searchState.isSearching
    ? searchState.pokemons
    : loadPokemonsState.pokemons;

  const showFooterLoading =
    (loadPokemonsState.isNextPageLoading && !searchState.isSearching) ||
    searchState.isApiSearching;

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [{ id: "search-bar", type: "search" }];
    if (loadPokemonsState.loading && !searchState.isSearching) {
      items.push({ id: "loading-state", type: "loading" });
      return items;
    }
    if (loadPokemonsState.isFirstPageError && !searchState.isSearching) {
      items.push({ id: "error-state", type: "error" });
      return items;
    }
    if (
      searchState.isSearching &&
      !searchState.isApiSearching &&
      displayPokemons?.length === 0
    ) {
      items.push({ id: "empty-state", type: "empty" });
      return items;
    }
    items.push(
      ...(displayPokemons?.map((p) => ({
        id: p.id,
        type: "pokemon" as const,
        data: p,
      })) ?? []),
    );
    return items;
  }, [
    displayPokemons,
    searchState.isSearching,
    searchState.isApiSearching,
    loadPokemonsState.isFirstPageError,
    loadPokemonsState.loading,
  ]);

  return { listData, showFooterLoading };
}
