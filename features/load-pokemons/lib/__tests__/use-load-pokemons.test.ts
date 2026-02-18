import { Pokemon, PokemonPreview } from "@/entities/pokemon";
import { createWrapper } from "@/shared/test-utils/react-query-wrapper";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useLoadPokemons } from "../use-load-pokemons";

// Mock the API module
jest.mock("@/entities/pokemon/api/pokemon-api");

const { fetchPokemon } = jest.requireMock(
  "@/entities/pokemon/api/pokemon-api"
);

describe("useLoadPokemons with React Query", () => {
  const mockPokemon1: Pokemon = {
    id: "001",
    name: "Bulbasaur",
    types: [],
    image: "https://example.com/bulbasaur.png",
    stats: [],
  };

  const mockPokemon2: Pokemon = {
    id: "002",
    name: "Ivysaur",
    types: [],
    image: "https://example.com/ivysaur.png",
    stats: [],
  };

  const mockPokemon3: Pokemon = {
    id: "003",
    name: "Venusaur",
    types: [],
    image: "https://example.com/venusaur.png",
    stats: [],
  };

  const mockPreviews: PokemonPreview[] = [
    { id: "001", name: "Bulbasaur" },
    { id: "002", name: "Ivysaur" },
    { id: "003", name: "Venusaur" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load pokemons on initial render", async () => {
    fetchPokemon.mockImplementation((id: string) => {
      if (id === "001") return Promise.resolve(mockPokemon1);
      if (id === "002") return Promise.resolve(mockPokemon2);
    });

    const previews = mockPreviews.slice(0, 2);
    const { result } = renderHook(() => useLoadPokemons(previews, 10), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.pokemons).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.pokemons).toEqual([mockPokemon1, mockPokemon2]);
    expect(result.current.state.error).toBe(null);
  });

  it("should not load when previews is null", () => {
    const { result } = renderHook(() => useLoadPokemons(null, 10), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.pokemons).toBe(null);
  });

  it("should handle loading states correctly", async () => {
    fetchPokemon.mockResolvedValue(mockPokemon1);

    const previews = [mockPreviews[0]];
    const { result } = renderHook(() => useLoadPokemons(previews, 10), {
      wrapper: createWrapper(),
    });

    // Check initial loading state
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.isNextPageLoading).toBe(false);

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.isNextPageLoading).toBe(false);
  });

  it("should handle errors correctly", async () => {
    const errorMessage = "Network error";
    fetchPokemon.mockRejectedValueOnce(new Error(errorMessage));

    const previews = [mockPreviews[0]];
    const { result } = renderHook(() => useLoadPokemons(previews, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.error).toBe(errorMessage);
    expect(result.current.state.pokemons).toBe(null);
  });

  it("should fetch next page when fetchNextPage is called", async () => {
    fetchPokemon.mockImplementation((id: string) => {
      if (id === "001") return Promise.resolve(mockPokemon1);
      if (id === "002") return Promise.resolve(mockPokemon2);
      if (id === "003") return Promise.resolve(mockPokemon3);
    });

    const { result } = renderHook(() => useLoadPokemons(mockPreviews, 2), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.pokemons).toEqual([mockPokemon1, mockPokemon2]);

    // Fetch next page
    result.current.actions.fetchNextPage();

    // Wait for next page to load
    await waitFor(() => {
      expect(result.current.state.pokemons).toEqual([
        mockPokemon1,
        mockPokemon2,
        mockPokemon3,
      ]);
    });

    expect(result.current.state.isNextPageLoading).toBe(false);
  });

  it("should detect end of items when page has fewer items than limit", async () => {
    fetchPokemon.mockResolvedValue(mockPokemon1);

    const previews = [mockPreviews[0]];
    const { result } = renderHook(() => useLoadPokemons(previews, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    // Should detect end of items
    expect(result.current.state.endOfItems).toBe(true);
  });

  it("should not detect end of items when page is full", async () => {
    const ids = Array.from({ length: 10 }, (_, i) =>
      String(i + 1).padStart(3, "0")
    );
    const previews: PokemonPreview[] = ids.map((id) => ({
      id,
      name: `Pokemon${id}`,
    }));

    const pokemons = ids.map((id) => ({
      id,
      name: `Pokemon${id}`,
      types: [],
      image: `https://example.com/pokemon${id}.png`,
      stats: [],
    }));
    fetchPokemon.mockImplementation((id: string) => {
      const pokemon = pokemons.find((p) => p.id === id);
      return Promise.resolve(pokemon);
    });

    const { result } = renderHook(() => useLoadPokemons(previews, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    // Should NOT detect end of items (full page means there might be more)
    expect(result.current.state.endOfItems).toBe(false);
  });
});
