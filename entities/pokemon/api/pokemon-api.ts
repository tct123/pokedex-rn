import { EvolutionStage, Pokemon, PokemonPreview } from "../model/pokemon";
import {
  ChainLink,
  EvolutionChainApiResponse,
  PokemonApiResponse,
  PokemonLocationResponse,
  PokemonSpeciesApiResponse,
  PokemonTypeDamageResponse,
  PokemonsApiResponse,
} from "./pokemon-api-response";
import { mapPokemonResponse, mapResponseTypeToPokemonType } from "./pokemon-mapper";

async function fetchPokemonSpecies(id: string): Promise<PokemonSpeciesApiResponse> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function fetchEvolutionChain(url: string): Promise<EvolutionChainApiResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function fetchWeaknesses(types: string[]): Promise<PokemonTypeDamageResponse[]> {
  const typeData = await Promise.all(
    types.map((type) =>
      fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`).then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json();
      }),
    ),
  );
  return typeData;
}

async function fetchLocations(id: string): Promise<PokemonLocationResponse[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch {
    return [];
  }
}

export function extractIdFromUrl(url: string): string {
  const segments = url.replace(/\/$/, "").split("/");
  return segments[segments.length - 1];
}

function flattenChain(chain: ChainLink): EvolutionStage[] {
  const stages: EvolutionStage[] = [];

  let current: ChainLink | undefined = chain;
  while (current) {
    const id = extractIdFromUrl(current.species.url).padStart(3, "0");
    const name =
      current.species.name.charAt(0).toUpperCase() + current.species.name.slice(1);
    const trigger = current.evolution_details[0]?.trigger?.name ?? "";
    const minLevel = current.evolution_details[0]?.min_level ?? null;

    stages.push({
      id,
      name,
      image: `https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/${id}.png`,
      minLevel,
      trigger,
    });

    current = current.evolves_to[0];
  }

  return stages;
}

export async function fetchPokemon(id: string): Promise<Pokemon> {
  try {
    const numericId = String(Number(id));
    const [pokemonResponse, speciesResponse, locationsResponse] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${numericId}`).then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json() as Promise<PokemonApiResponse>;
      }),
      fetchPokemonSpecies(numericId),
      fetchLocations(numericId),
    ]);

    const pokemon = mapPokemonResponse(pokemonResponse);

    const englishFlavorText = speciesResponse.flavor_text_entries.find(
      (entry) => entry.language.name === "en",
    );
    const englishGenus = speciesResponse.genera.find(
      (entry) => entry.language.name === "en",
    );

    pokemon.description =
      englishFlavorText?.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ") ?? "";
    pokemon.genus = englishGenus?.genus ?? "";
    pokemon.genderRate = speciesResponse.gender_rate;
    pokemon.catchRate = speciesResponse.capture_rate;
    pokemon.baseHappiness = speciesResponse.base_happiness;
    pokemon.growthRate = speciesResponse.growth_rate.name;
    pokemon.baseExperience = pokemonResponse.base_experience;
    pokemon.locations = locationsResponse.map((loc) => ({
      id: extractIdFromUrl(loc.location_area.url),
      name: loc.location_area.name,
    }));

    try {
      const [evolutionChainResponse, weakNessesResponse] = await Promise.all([
        fetchEvolutionChain(speciesResponse.evolution_chain.url),
        fetchWeaknesses(pokemon.types.map((t) => t.name)),
      ]);
      pokemon.evolutionChain = flattenChain(evolutionChainResponse.chain);
      const weaknessNames = [
        ...new Set(
          weakNessesResponse.flatMap((res) =>
            res.damage_relations.double_damage_from.map((t) => t.name),
          ),
        ),
      ];
      pokemon.weakNesses = weaknessNames.map((typeName) =>
        mapResponseTypeToPokemonType(typeName),
      );
    } catch (error) {
      console.log("## error", error);
      pokemon.evolutionChain = [];
      pokemon.weakNesses = [];
    }

    return pokemon;
  } catch (error) {
    console.warn("Error fetching Pokémon", error);
    throw error;
  }
}

export async function fetchPokemons(limit: number, offset: number): Promise<string[]> {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const apiResponse: PokemonsApiResponse = await response.json();
  return apiResponse.results.map((p) => extractIdFromUrl(p.url).padStart(3, "0"));
}

export async function fetchAllPokemonPreviews(): Promise<PokemonPreview[]> {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const apiResponse: PokemonsApiResponse = await response.json();
  return apiResponse.results.map((p) => ({
    id: extractIdFromUrl(p.url).padStart(3, "0"),
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
  }));
}

export async function searchPokemonByName(query: string): Promise<Pokemon | null> {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return null;
    }

    // Fetch basic pokemon data by name or ID
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedQuery}`);

    // Pokemon not found - return null instead of throwing
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const pokemonResponse: PokemonApiResponse = await response.json();

    // Return only basic pokemon data - no species or evolution chain
    // Full data will be fetched when the details page is opened
    return mapPokemonResponse(pokemonResponse);
  } catch (error) {
    console.error("Error searching Pokémon:", error);
    throw error;
  }
}
