import { fetchPokemon, fetchPokemons, extractIdFromUrl } from "../pokemon-api";
import { PokemonApiResponse } from "../pokemon-api-response";

const BASE_URL = "https://pokedex-mouzinho.leapcell.app";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockApiResponse: PokemonApiResponse = {
  id: 1,
  number: "#001",
  name: "Bulbasaur",
  sprite_url: "https://example.com/001.png",
  types: ["grass", "poison"],
  about: {
    description: "A strange seed was planted on its back at birth.",
    species: "Seed Pokémon",
    height_m: 0.7,
    weight_kg: 6.9,
    weaknesses: ["fire", "flying"],
    gender: {
      male_percent: 87.5,
      female_percent: 12.5,
      is_genderless: false,
    },
  },
  stats: {
    base: [
      { name: "hp", base_stat: 45 },
      { name: "attack", base_stat: 49 },
      { name: "special-attack", base_stat: 65 },
    ],
    total: 318,
  },
  type_defenses: [],
  training: {
    ev_yield: [{ stat: "special-attack", amount: 1 }],
    catch_rate: 45,
    base_friendship: 70,
    base_experience: 64,
    growth_rate: "Medium Slow",
  },
  locations: [
    { id: 281, name: "cerulean-city-area" },
    { id: 285, name: "pallet-town-area" },
  ],
  evolution_chain: [
    {
      id: 1,
      name: "Bulbasaur",
      sprite_url: "https://example.com/001.png",
      trigger: null,
      evolves_to: [
        {
          id: 2,
          name: "Ivysaur",
          sprite_url: "https://example.com/002.png",
          trigger: "Level 16",
          evolves_to: [],
        },
      ],
    },
  ],
};

const mockGenderlessResponse: PokemonApiResponse = {
  ...mockApiResponse,
  id: 132,
  name: "Ditto",
  about: {
    ...mockApiResponse.about,
    gender: {
      male_percent: 0,
      female_percent: 0,
      is_genderless: true,
    },
  },
};

function makeOkResponse(body: unknown) {
  return { ok: true, json: async () => body };
}

function makeErrorResponse() {
  return { ok: false, status: 404, json: async () => ({}) };
}

// ─── extractIdFromUrl ────────────────────────────────────────────────────────

describe("extractIdFromUrl", () => {
  it("extracts the id from a standard URL", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25")).toBe("25");
  });

  it("strips a trailing slash before extracting", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe("25");
  });

  it("works for multi-digit ids", () => {
    expect(extractIdFromUrl("https://example.com/pokemon/1000")).toBe("1000");
  });
});

// ─── fetchPokemon ────────────────────────────────────────────────────────────

describe("fetchPokemon", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(makeOkResponse(mockApiResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls the correct URL, stripping zero-padding from the id", async () => {
    await fetchPokemon("001");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/pokemon/1`);
  });

  it("zero-pads the returned id to 3 digits", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.id).toBe("001");
  });

  it("maps the name correctly", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.name).toBe("Bulbasaur");
  });

  it("maps types to PokemonType objects with correct names", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.types).toHaveLength(2);
    expect(pokemon.types[0].name).toBe("Grass");
    expect(pokemon.types[1].name).toBe("Poison");
  });

  it("maps the sprite URL", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.image).toBe("https://example.com/001.png");
  });

  it("maps description and genus", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.description).toBe("A strange seed was planted on its back at birth.");
    expect(pokemon.genus).toBe("Seed Pokémon");
  });

  it("maps height and weight", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.height).toBe(0.7);
    expect(pokemon.weight).toBe(6.9);
  });

  it("maps training data (catchRate, baseHappiness, growthRate, baseExperience)", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.catchRate).toBe(45);
    expect(pokemon.baseHappiness).toBe(70);
    expect(pokemon.growthRate).toBe("Medium Slow");
    expect(pokemon.baseExperience).toBe(64);
  });

  it("maps gender correctly for a non-genderless pokemon", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.gender).toEqual({
      malePercent: 87.5,
      femalePercent: 12.5,
      isGenderless: false,
    });
  });

  it("maps gender correctly for a genderless pokemon", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockGenderlessResponse));
    const pokemon = await fetchPokemon("132");
    expect(pokemon.gender).toEqual({
      malePercent: 0,
      femalePercent: 0,
      isGenderless: true,
    });
  });

  it("maps stats and applies ev_yield as effort", async () => {
    const pokemon = await fetchPokemon("1");
    const spAtk = pokemon.stats.find((s) => s.name === "Special attack");
    expect(spAtk?.baseStat).toBe(65);
    expect(spAtk?.effort).toBe(1);
  });

  it("defaults effort to 0 for stats without an ev_yield entry", async () => {
    const pokemon = await fetchPokemon("1");
    const hp = pokemon.stats.find((s) => s.name === "Hp");
    expect(hp?.effort).toBe(0);
  });

  it("maps weaknesses to PokemonType objects", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.weakNesses).toHaveLength(2);
    expect(pokemon.weakNesses![0].name).toBe("Fire");
    expect(pokemon.weakNesses![1].name).toBe("Flying");
  });

  it("maps locations", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.locations).toEqual([
      { id: "281", name: "cerulean-city-area" },
      { id: "285", name: "pallet-town-area" },
    ]);
  });

  it("maps the evolution chain with zero-padded ids", async () => {
    const pokemon = await fetchPokemon("1");
    expect(pokemon.evolutionChain).toHaveLength(1);
    const root = pokemon.evolutionChain![0];
    expect(root.id).toBe("001");
    expect(root.name).toBe("Bulbasaur");
    expect(root.trigger).toBe("");
  });

  it("maps nested evolution stages with trigger text", async () => {
    const pokemon = await fetchPokemon("1");
    const evolved = pokemon.evolutionChain![0].evolvesTo[0];
    expect(evolved.id).toBe("002");
    expect(evolved.name).toBe("Ivysaur");
    expect(evolved.trigger).toBe("Level 16");
    expect(evolved.evolvesTo).toEqual([]);
  });

  it("throws when the network response is not ok", async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse());
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await expect(fetchPokemon("1")).rejects.toThrow("Network response was not ok");
    warnSpy.mockRestore();
  });

  it("throws and warns on a network-level error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await expect(fetchPokemon("1")).rejects.toThrow("Failed to fetch");
    expect(warnSpy).toHaveBeenCalledWith(
      "Error fetching Pokémon",
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});

// ─── fetchPokemons ───────────────────────────────────────────────────────────

describe("fetchPokemons", () => {
  const mockListResponse = { results: [mockApiResponse] };

  beforeEach(() => {
    mockFetch.mockResolvedValue(makeOkResponse(mockListResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns a mapped array of Pokemon", async () => {
    const pokemons = await fetchPokemons({ limit: 1, offset: 0 });
    expect(pokemons).toHaveLength(1);
    expect(pokemons[0].name).toBe("Bulbasaur");
    expect(pokemons[0].id).toBe("001");
  });

  it("maps the gender field for every list item (regression: was missing)", async () => {
    const pokemons = await fetchPokemons({ limit: 1, offset: 0 });
    expect(pokemons[0].gender).toEqual({
      malePercent: 87.5,
      femalePercent: 12.5,
      isGenderless: false,
    });
  });

  it("maps genderless pokemon in list correctly", async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ results: [mockGenderlessResponse] }),
    );
    const pokemons = await fetchPokemons({ limit: 1, offset: 0 });
    expect(pokemons[0].gender).toEqual({
      malePercent: 0,
      femalePercent: 0,
      isGenderless: true,
    });
  });

  it("includes limit and offset in the request URL", async () => {
    await fetchPokemons({ limit: 30, offset: 60 });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("limit=30");
    expect(calledUrl).toContain("offset=60");
  });

  it("appends query param when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, query: "bulba" });
    expect(mockFetch.mock.calls[0][0]).toContain("query=bulba");
  });

  it("appends sort_by and sort_order params when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, sort_by: "Name", sort_order: "Asc" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("sort_by=Name");
    expect(url).toContain("sort_order=Asc");
  });

  it("appends type filter when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, type: "fire" });
    expect(mockFetch.mock.calls[0][0]).toContain("type=fire");
  });

  it("appends weakness filter when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, weakness: "water" });
    expect(mockFetch.mock.calls[0][0]).toContain("weakness=water");
  });

  it("appends height range params when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, height_min: 0.5, height_max: 2.0 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("height_min=0.5");
    expect(url).toContain("height_max=2");
  });

  it("appends weight range params when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, weight_min: 5, weight_max: 100 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("weight_min=5");
    expect(url).toContain("weight_max=100");
  });

  it("appends number range params when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, number_from: 1, number_to: 151 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("number_from=1");
    expect(url).toContain("number_to=151");
  });

  it("appends generation filter when provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0, generation: 1 });
    expect(mockFetch.mock.calls[0][0]).toContain("generation=1");
  });

  it("does not append optional params when they are not provided", async () => {
    await fetchPokemons({ limit: 10, offset: 0 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain("query=");
    expect(url).not.toContain("type=");
    expect(url).not.toContain("generation=");
  });

  it("throws when the network response is not ok", async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse());
    await expect(fetchPokemons({ limit: 10, offset: 0 })).rejects.toThrow(
      "Network response was not ok",
    );
  });
});
