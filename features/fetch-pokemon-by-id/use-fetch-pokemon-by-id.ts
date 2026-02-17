import { Pokemon } from "@/entities/pokemon";
import { fetchPokemon } from "@/entities/pokemon/api/pokemon-api";
import { pokemonKeys } from "@/shared/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface FetchPokemonState {
  pokemon: Pokemon | null;
  loading: boolean;
  error: string | null;
}

export default function useFetchPokemonById(id: string) {
  const query = useQuery({
    queryKey: pokemonKeys.detail(id),
    queryFn: () => fetchPokemon(id),
    enabled: !!id,
  });

  return {
    pokemon: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
