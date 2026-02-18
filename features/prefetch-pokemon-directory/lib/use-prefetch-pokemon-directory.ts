import { PokemonPreview } from "@/entities/pokemon";
import { fetchAllPokemonPreviews } from "@/entities/pokemon/api/pokemon-api";
import { pokemonKeys } from "@/shared/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface PrefetchPokemonDirectoryState {
  previews: PokemonPreview[] | null;
  isLoading: boolean;
}

export function usePrefetchPokemonDirectory() {
  const query = useQuery({
    queryKey: pokemonKeys.directory(),
    queryFn: fetchAllPokemonPreviews,
  });

  const state = useMemo<PrefetchPokemonDirectoryState>(
    () => ({
      previews: query.data ?? null,
      isLoading: query.isLoading,
    }),
    [query.data, query.isLoading],
  );

  return { state };
}
