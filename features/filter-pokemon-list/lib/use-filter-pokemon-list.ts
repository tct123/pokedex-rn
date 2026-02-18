import { Pokemon, PokemonPreview } from "@/entities/pokemon";
import { fetchPokemon } from "@/entities/pokemon/api/pokemon-api";
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

function filterPreviewsByText(previews: PokemonPreview[], text: string): PokemonPreview[] {
  const searchTerm = text.toLowerCase();
  return previews.filter((preview) => {
    if (preview.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
    const numericId = Number(searchTerm);
    if (!isNaN(numericId)) {
      return Number(preview.id) === numericId;
    }
    return false;
  });
}

export function useFilterPokemonList(
  pokemons: Pokemon[] | null,
  previews: PokemonPreview[] | null,
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const timerRef = useRef<SearchTermTimeout | null>(null);

  const shouldSearch = debouncedSearchTerm.length > 0 && previews !== null;

  const matchingPreviewIds = useMemo(() => {
    if (!shouldSearch) return [];
    return filterPreviewsByText(previews!, debouncedSearchTerm).map((p) => p.id);
  }, [shouldSearch, previews, debouncedSearchTerm]);

  const directorySearchQuery = useQuery({
    queryKey: pokemonKeys.search(debouncedSearchTerm),
    queryFn: async () => {
      const results = await Promise.allSettled(matchingPreviewIds.map((id) => fetchPokemon(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    enabled: shouldSearch && matchingPreviewIds.length > 0,
  });

  const onSearch = useCallback((name: string) => {
    if (timerRef.current?.timeoutRef) {
      clearTimeout(timerRef.current.timeoutRef);
    }
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(name);
    }, 500);
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

  const finalPokemons = useMemo(() => {
    if (!shouldSearch) return pokemons;
    if (matchingPreviewIds.length === 0) return [];
    if (directorySearchQuery.isLoading) return [];
    if (directorySearchQuery.data) return directorySearchQuery.data;
    return [];
  }, [shouldSearch, pokemons, matchingPreviewIds.length, directorySearchQuery.isLoading, directorySearchQuery.data]);

  const isDirectorySearching = shouldSearch && matchingPreviewIds.length > 0 && directorySearchQuery.isLoading;

  const memoizedState = useMemo(
    () => ({
      pokemons: finalPokemons,
      isSearching: debouncedSearchTerm.length > 0,
      isApiSearching: isDirectorySearching,
    }),
    [finalPokemons, debouncedSearchTerm, isDirectorySearching],
  );

  return {
    state: memoizedState,
    actions,
  } as PokemonSearchResult;
}
