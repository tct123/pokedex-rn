import { Pokemon } from "@/entities/pokemon";
import { searchPokemonByName } from "@/entities/pokemon/api/pokemon-api";
import { pokemonKeys } from "@/shared/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PokemonSearchState {
  isSearching: boolean;
  pokemons: Pokemon[] | null;
  isApiSearching: boolean;
}

interface PokemonSearchActions {
  onSearch: (name: string) => void;
}

export interface PokemonSearchResult {
  state: PokemonSearchState;
  actions: PokemonSearchActions;
}

interface SearchTermTimeout {
  timeoutRef: number;
  name: string;
}

function filterPokemonsByText(pokemons: Pokemon[], text: string): Pokemon[] {
  if (text.length === 0) return pokemons;
  const searchTerm = text.toLowerCase();
  return pokemons.filter((pokemon) => {
    // Match by name
    if (pokemon.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
    // Match by ID (handle both padded "025" and unpadded "25")
    const numericId = Number(searchTerm);
    if (!isNaN(numericId)) {
      return Number(pokemon.id) === numericId;
    }
    return false;
  });
}

export function useFilterPokemonList(pokemons: Pokemon[] | null) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const timerRef = useRef<SearchTermTimeout | null>(null);

  // Filter local Pokemon list
  const filteredPokemons = useMemo(() => {
    if (!pokemons) return null;
    return filterPokemonsByText(pokemons, debouncedSearchTerm);
  }, [pokemons, debouncedSearchTerm]);

  // Trigger API search only when local filtering returns no results
  const shouldSearchApi =
    debouncedSearchTerm.length > 0 &&
    filteredPokemons !== null &&
    filteredPokemons.length === 0;

  // API search query
  const apiSearchQuery = useQuery({
    queryKey: pokemonKeys.search(debouncedSearchTerm),
    queryFn: () => searchPokemonByName(debouncedSearchTerm),
    enabled: shouldSearchApi,
  });

  const onSearch = useCallback((name: string) => {
    if (timerRef.current?.timeoutRef) {
      clearTimeout(timerRef.current.timeoutRef);
    }
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(name);
    }, 300);
    timerRef.current = {
      timeoutRef: timeout,
      name: name,
    };
  }, []);

  const actions = useMemo(() => ({ onSearch }), [onSearch]);

  useEffect(() => {
    return () => {
      if (timerRef.current?.timeoutRef) {
        clearTimeout(timerRef.current.timeoutRef);
      }
    };
  }, []);

  // Determine final Pokemon list
  const finalPokemons = useMemo(() => {
    // If API search is loading, return empty array to keep list mounted
    if (shouldSearchApi && apiSearchQuery.isLoading) {
      return [];
    }

    // If API search has a result, return it as a single-item array
    if (shouldSearchApi && apiSearchQuery.data) {
      return [apiSearchQuery.data];
    }

    // Otherwise, return local filtered results
    return filteredPokemons;
  }, [shouldSearchApi, apiSearchQuery.isLoading, apiSearchQuery.data, filteredPokemons]);

  const memoizedState = useMemo(
    () => ({
      pokemons: finalPokemons,
      isSearching: debouncedSearchTerm.length > 0,
      isApiSearching: shouldSearchApi && apiSearchQuery.isLoading,
    }),
    [finalPokemons, debouncedSearchTerm, shouldSearchApi, apiSearchQuery.isLoading],
  );

  return {
    state: memoizedState,
    actions,
  } as PokemonSearchResult;
}
